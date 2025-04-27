/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: MatchYourPath
-- ------------------------------------------------------
-- Server version	10.11.11-MariaDB-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Commentaire`
--

DROP TABLE IF EXISTS `Commentaire`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Commentaire` (
  `CommentaireID` int(11) NOT NULL AUTO_INCREMENT,
  `Contenu` text NOT NULL,
  `date_commentaire` datetime NOT NULL DEFAULT current_timestamp(),
  `PostID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  PRIMARY KEY (`CommentaireID`),
  KEY `PostID` (`PostID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Commentaire_ibfk_1` FOREIGN KEY (`PostID`) REFERENCES `Publication` (`PostID`) ON DELETE CASCADE,
  CONSTRAINT `Commentaire_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Commentaire`
--

LOCK TABLES `Commentaire` WRITE;
/*!40000 ALTER TABLE `Commentaire` DISABLE KEYS */;
/*!40000 ALTER TABLE `Commentaire` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ConnectionRequest`
--

DROP TABLE IF EXISTS `ConnectionRequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ConnectionRequest` (
  `RequestID` int(11) NOT NULL AUTO_INCREMENT,
  `SenderID` int(11) NOT NULL,
  `ReceiverID` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `date_request` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`RequestID`),
  KEY `SenderID` (`SenderID`),
  KEY `ReceiverID` (`ReceiverID`),
  CONSTRAINT `ConnectionRequest_ibfk_1` FOREIGN KEY (`SenderID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `ConnectionRequest_ibfk_2` FOREIGN KEY (`ReceiverID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ConnectionRequest`
--

LOCK TABLES `ConnectionRequest` WRITE;
/*!40000 ALTER TABLE `ConnectionRequest` DISABLE KEYS */;
INSERT INTO `ConnectionRequest` VALUES
(1,3,1,'accepted','2025-04-27 09:55:31'),
(2,3,9,'accepted','2025-04-27 13:04:09'),
(3,9,1,'accepted','2025-04-27 16:24:19');
/*!40000 ALTER TABLE `ConnectionRequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Connexion`
--

DROP TABLE IF EXISTS `Connexion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Connexion` (
  `ConnexionID` int(11) NOT NULL AUTO_INCREMENT,
  `date_connexion` datetime NOT NULL DEFAULT current_timestamp(),
  `UserID_0` int(11) NOT NULL,
  `UserID_1` int(11) NOT NULL,
  PRIMARY KEY (`ConnexionID`),
  KEY `UserID_0` (`UserID_0`),
  KEY `UserID_1` (`UserID_1`),
  KEY `idx_date_connexion` (`date_connexion`),
  CONSTRAINT `Connexion_ibfk_1` FOREIGN KEY (`UserID_0`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Connexion_ibfk_2` FOREIGN KEY (`UserID_1`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Connexion`
--

LOCK TABLES `Connexion` WRITE;
/*!40000 ALTER TABLE `Connexion` DISABLE KEYS */;
INSERT INTO `Connexion` VALUES
(1,'2025-04-27 09:56:17',3,1),
(2,'2025-04-27 15:20:51',3,9),
(3,'2025-04-27 16:24:58',9,1);
/*!40000 ALTER TABLE `Connexion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Message`
--

DROP TABLE IF EXISTS `Message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Message` (
  `messageID` int(11) NOT NULL AUTO_INCREMENT,
  `message` text DEFAULT NULL,
  `date_message` datetime NOT NULL DEFAULT current_timestamp(),
  `SenderID` int(11) NOT NULL,
  `ReceiverID` int(11) NOT NULL,
  PRIMARY KEY (`messageID`),
  KEY `SenderID` (`SenderID`),
  KEY `ReceiverID` (`ReceiverID`),
  KEY `idx_date_message` (`date_message`),
  CONSTRAINT `Message_ibfk_1` FOREIGN KEY (`SenderID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Message_ibfk_2` FOREIGN KEY (`ReceiverID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Message`
--

LOCK TABLES `Message` WRITE;
/*!40000 ALTER TABLE `Message` DISABLE KEYS */;
INSERT INTO `Message` VALUES
(1,'hey!','2025-04-27 10:17:29',1,3),
(2,'yo claude!','2025-04-27 10:17:58',3,1),
(5,'heyyy','2025-04-27 13:06:53',3,9),
(6,'yooo','2025-04-27 16:24:27',9,3),
(7,'YO POTO','2025-04-27 16:25:05',1,9);
/*!40000 ALTER TABLE `Message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Note`
--

DROP TABLE IF EXISTS `Note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Note` (
  `noteID` int(11) NOT NULL AUTO_INCREMENT,
  `valeur` int(11) NOT NULL,
  `commentaire` varchar(1000) DEFAULT NULL,
  `AuthorID` int(11) NOT NULL,
  `EcoleID` int(11) NOT NULL,
  PRIMARY KEY (`noteID`),
  KEY `AuthorID` (`AuthorID`),
  KEY `EcoleID` (`EcoleID`),
  CONSTRAINT `Note_ibfk_1` FOREIGN KEY (`AuthorID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Note_ibfk_2` FOREIGN KEY (`EcoleID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Note`
--

LOCK TABLES `Note` WRITE;
/*!40000 ALTER TABLE `Note` DISABLE KEYS */;
/*!40000 ALTER TABLE `Note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Publication`
--

DROP TABLE IF EXISTS `Publication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Publication` (
  `PostID` int(11) NOT NULL AUTO_INCREMENT,
  `Titre` varchar(50) NOT NULL,
  `Contenu` text NOT NULL,
  `date_post` datetime NOT NULL DEFAULT current_timestamp(),
  `UserID` int(11) NOT NULL,
  `PostImagePath` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`PostID`),
  KEY `UserID` (`UserID`),
  KEY `idx_date_post` (`date_post`),
  CONSTRAINT `Publication_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Publication`
--

LOCK TABLES `Publication` WRITE;
/*!40000 ALTER TABLE `Publication` DISABLE KEYS */;
INSERT INTO `Publication` VALUES
(1,'My first post','HEYOYOOYOYOOYOYOYOYOO','2025-04-26 22:05:50',3,NULL),
(2,'BLABLABLA','OUAIS OUAIS BLABLABLA','2025-04-27 16:24:10',9,NULL);
/*!40000 ALTER TABLE `Publication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Utilisateur`
--

DROP TABLE IF EXISTS `Utilisateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Utilisateur` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Nom` varchar(50) NOT NULL,
  `Password` varchar(60) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `Statut` varchar(50) NOT NULL,
  `ProfileImagePath` varchar(255) DEFAULT NULL,
  `BannerImagePath` varchar(255) DEFAULT NULL,
  `Biographie` text DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Utilisateur`
--

LOCK TABLES `Utilisateur` WRITE;
/*!40000 ALTER TABLE `Utilisateur` DISABLE KEYS */;
INSERT INTO `Utilisateur` VALUES
(1,'claude','$2b$10$93OHH2kkT/j0OhRMCm33FuIGLQINwWAPIf7iabuMU/XvxtVh5Er86','claude@gmail.com','etudiant',NULL,NULL,NULL),
(3,'Theophane','$2b$10$0SSUnlW02z9mC.pXE270SOyMtIsucUngaTEWZbF67ZdNMSdVV0tpO','theophane.roux@gmail.com','admin',NULL,NULL,NULL),
(9,'hergam','$2b$10$EZxbe3DEEDuxDUZ7lirf/O7sTPTEi/CfiC0kWRQgGs8VHwj1MhhxC','hergam@gmail.com','etudiant','/uploads/image-1745760708283-593808523.jpg',NULL,'fzeioçprhyé\"pfhgezà'),
(10,'Alice','$2b$10$1Kk0JvLSgb6igrEKAgWLg.loT7gPMR.o1EnRTdZfMGdVe8I41zTKS','alice@gmail.com','etudiant',NULL,NULL,NULL),
(11,'Bernard','$2b$10$L69VCaru.ITgED2phyQ91.2w899dm0HIswac4bpbw0Sw.BHp2qXZS','bernard@gmail.com','etudiant',NULL,NULL,NULL),
(12,'EFREI Paris','$2b$10$dvFNq3N7QtG31KSuJANhD.daf2Jm55/pfmSCBps3/xUyxmVhY8ysW','efrei@efrei.net','ecole','/uploads/image-1745767125015-837893376.jpeg','/uploads/image-1745767120495-284261320.png','EFREI Paris est une grande école d’ingénieurs française, spécialisée dans les technologies du numérique et l\'informatique. Fondée en 1936, elle forme des ingénieurs polyvalents dans les domaines de l’intelligence artificielle, de la cybersécurité, du développement logiciel, des réseaux, du big data, et de l’innovation technologique.\nSituée à Villejuif (près de Paris), EFREI propose un cursus d’excellence combinant sciences, techniques et entrepreneuriat, avec de nombreux doubles diplômes, programmes internationaux et partenariats industriels.\nL\'école est reconnue par la Commission des Titres d\'Ingénieur (CTI) et fait partie des écoles de référence dans l’écosystème numérique français.'),
(13,'ECE','$2b$10$sGCRLSxa5K3hwGW8TV9g2OPInJ6gnFzjYrK7kt3VfA910EJLhb.vu','ece@ece.fr','ecole',NULL,NULL,NULL);
/*!40000 ALTER TABLE `Utilisateur` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-27 22:31:26
