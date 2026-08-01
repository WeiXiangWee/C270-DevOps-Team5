-- MySQL dump 10.13  Distrib 8.4.6, for Win64 (x86_64)
--
-- Host: localhost    Database: c270
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ============================================
-- RP Sports Facility Booking System
-- Database Initialization Script
-- Team 5 LaunchLab | C270 DevOps Essentials
-- ============================================

-- Create database if it does not exist (for AWS RDS)
CREATE DATABASE IF NOT EXISTS c270;

-- Use the c270 database
USE c270;

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `userName` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `date` varchar(20) NOT NULL,
  `duration` varchar(50) NOT NULL,
  `remarks` text,
  `status` enum('confirmed','cancelled') DEFAULT 'confirmed',
  `remarks_status` enum('shown','pending') DEFAULT 'shown',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilities`
--

DROP TABLE IF EXISTS `facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `capacity` int NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `description` text,
  `location` varchar(100) DEFAULT NULL,
  `equipment` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilities`
--

LOCK TABLES `facilities` WRITE;
/*!40000 ALTER TABLE `facilities` DISABLE KEYS */;
INSERT INTO `facilities` VALUES (1,'Competition Hall','Indoor',500,'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600','Fully air-conditioned hall for basketball, volleyball and netball. Features gallery stand for spectators.','Level 1, Sports Complex','Basketball hoops, volleyball nets, netball posts provided'),(2,'Badminton Hall (6 Courts)','Indoor',24,'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600','6 professional badminton courts with wooden flooring. Suitable for recreational play and competitive matches.','Level 2, Sports Complex','Badminton nets provided, shuttlecocks available for purchase'),(3,'Table Tennis Hall (6 Tables)','Indoor',12,'https://images.unsplash.com/photo-1611251135345-18c56206b863?w=600','6 table tennis tables available for booking and casual play sessions.','Level 2, Sports Complex','6 tables with nets provided, paddles and balls available'),(4,'Multi-Purpose Hall','Indoor',100,'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600','Versatile hall suitable for various sports and indoor activities.','Level 1, Sports Complex','Flexible setup, equipment varies by activity'),(5,'Tennis / Basketball / Futsal Court','Outdoor',30,'https://images.unsplash.com/photo-1505666287802-931dc83948e9?w=600','Multi-purpose outdoor court for tennis, basketball and futsal.','Outdoor, Ground Level','Basketball hoops, tennis nets, futsal goals provided'),(6,'Football and Rugby Field','Outdoor',100,'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600','Full size football and rugby field with 500-pax seating gallery at the highest point of RP campus.','Outdoor, Rooftop Level','Football goals, rugby posts provided'),(7,'Swimming Pool','Aquatics',50,'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600','Olympic-size pool with warm-up pool and baby wading pool. 300-pax viewing gallery available.','Ground Level, Sports Complex','Lane ropes, kickboards, floats available'),(8,'Martial Arts Room','Indoor',50,'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600','50 persons capacity with tatami mats. Suitable for taekwondo, judo, aikido and other martial arts.','Level 2, Sports Complex','Tatami mats provided for all users');
/*!40000 ALTER TABLE `facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance`
--

DROP TABLE IF EXISTS `maintenance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facility` varchar(100) NOT NULL,
  `startDate` varchar(20) NOT NULL,
  `endDate` varchar(20) NOT NULL,
  `reason` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance`
--

LOCK TABLES `maintenance` WRITE;
/*!40000 ALTER TABLE `maintenance` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reset_code` varchar(6) DEFAULT NULL,
  `reset_code_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Yan Paing Oo','25036509@rp.edu.sg','84542752','$2b$10$h4ORPsWMfJO.glJaYLdw7OjBgXwSj9abt6Bd7uG6kuhGWzdPQIiZ.','admin','2026-07-02 11:42:04',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-25 15:13:54
