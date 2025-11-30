import { supabase } from './supabase';
import { ProductReview } from '../types';

export const supabaseReviewAPI = {
  createReview: async (
    productId: string,
    rating: number,
    title: string,
    comment: string,
    images?: string[]
  ) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          title,
          comment,
          is_verified: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (images && images.length > 0) {
        for (const imageUrl of images) {
          await supabase
            .from('review_images')
            .insert({
              review_id: data.id,
              image_url: imageUrl,
            });
        }
      }

      return { success: true, review: data };
    } catch (error: any) {
      console.error('Create review error:', error);
      throw new Error(error.message || 'Failed to create review');
    }
  },

  updateReview: async (
    reviewId: string,
    rating: number,
    title: string,
    comment: string,
    images?: string[]
  ) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .update({
          rating,
          title,
          comment,
        })
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (images && images.length > 0) {
        await supabase.from('review_images').delete().eq('review_id', reviewId);

        for (const imageUrl of images) {
          await supabase
            .from('review_images')
            .insert({
              review_id: reviewId,
              image_url: imageUrl,
            });
        }
      }

      return { success: true, review: data };
    } catch (error: any) {
      console.error('Update review error:', error);
      throw new Error(error.message || 'Failed to update review');
    }
  },

  deleteReview: async (reviewId: string) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Delete review error:', error);
      throw new Error(error.message || 'Failed to delete review');
    }
  },

  getProductReviews: async (productId: string, rating?: number) => {
    try {
      let query = supabase
        .from('product_reviews')
        .select(
          `
          id,
          product_id,
          user_id,
          rating,
          title,
          comment,
          is_verified,
          helpful_count,
          created_at,
          updated_at,
          user:auth.users(id, email, user_metadata),
          images:review_images(image_url)
        `
        )
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (rating) {
        query = query.eq('rating', rating);
      }

      const { data, error } = await query;

      if (error) throw error;

      const reviews: ProductReview[] = (data || []).map((review: any) => ({
        id: review.id,
        productId: review.product_id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerified: review.is_verified,
        helpfulCount: review.helpful_count,
        images: review.images?.map((img: any) => img.image_url) || [],
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        user: {
          id: review.user_id,
          fullName: review.user?.user_metadata?.full_name || 'Anonymous',
          avatarUrl: review.user?.user_metadata?.avatar_url,
        },
      }));

      return { success: true, reviews };
    } catch (error: any) {
      console.error('Get reviews error:', error);
      throw new Error(error.message || 'Failed to fetch reviews');
    }
  },

  getProductRatingSummary: async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) throw error;

      const reviews = data || [];
      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      const ratingDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      reviews.forEach((review) => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      return {
        success: true,
        summary: {
          totalReviews,
          averageRating,
          ratingDistribution,
        },
      };
    } catch (error: any) {
      console.error('Get rating summary error:', error);
      throw new Error(error.message || 'Failed to fetch rating summary');
    }
  },

  markReviewAsHelpful: async (reviewId: string) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error: voteError } = await supabase
        .from('review_helpful_votes')
        .insert({
          review_id: reviewId,
          user_id: user.id,
        });

      if (voteError && !voteError.message.includes('duplicate')) {
        throw voteError;
      }

      const { data, error } = await supabase
        .from('review_helpful_votes')
        .select()
        .eq('review_id', reviewId);

      if (error) throw error;

      await supabase
        .from('product_reviews')
        .update({ helpful_count: data?.length || 0 })
        .eq('id', reviewId);

      return { success: true };
    } catch (error: any) {
      console.error('Mark helpful error:', error);
      throw new Error(error.message || 'Failed to mark review as helpful');
    }
  },

  canUserReviewProduct: async (productId: string) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return { success: true, canReview: false };
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { success: true, canReview: !data };
    } catch (error: any) {
      console.error('Can review check error:', error);
      return { success: true, canReview: true };
    }
  },

  getUserReviews: async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .select(
          `
          id,
          product_id,
          rating,
          title,
          comment,
          is_verified,
          helpful_count,
          created_at,
          updated_at,
          images:review_images(image_url)
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviews: ProductReview[] = (data || []).map((review: any) => ({
        id: review.id,
        productId: review.product_id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerified: review.is_verified,
        helpfulCount: review.helpful_count,
        images: review.images?.map((img: any) => img.image_url) || [],
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        user: {
          id: user.id,
          fullName: user.user_metadata?.full_name || user.email || 'Anonymous',
          avatarUrl: user.user_metadata?.avatar_url,
        },
      }));

      return { success: true, reviews };
    } catch (error: any) {
      console.error('Get user reviews error:', error);
      throw new Error(error.message || 'Failed to fetch user reviews');
    }
  },
};
