@@ .. @@
 -- Initialize Sanekey Store Database
 -- Run this script to set up the database
 
--- Create database if it doesn't exist
-CREATE DATABASE IF NOT EXISTS sanekey_store;
+-- Create database if it doesn't exist (connect to port 3307)
+CREATE DATABASE IF NOT EXISTS sanekey_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 USE sanekey_store;