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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Commentaire`
--

LOCK TABLES `Commentaire` WRITE;
/*!40000 ALTER TABLE `Commentaire` DISABLE KEYS */;
INSERT INTO `Commentaire` VALUES
(2,'Merci pour ton partage. N\'hésite pas à explorer les ressources comme Pôle Emploi ou l\'Onisep pour affiner ton projet. Bonne continuation dans ta recherche.','2025-04-28 00:44:21',3,13),
(3,'Très intéressant, merci pour le partage !','2025-04-28 09:15:22',3,1),
(4,'As-tu pensé à faire un bilan de compétences ?','2025-04-28 09:30:45',3,9),
(5,'Le secteur du numérique recrute beaucoup en ce moment.','2025-04-28 10:05:33',3,10),
(6,'Je te conseille de regarder les MOOCs sur Coursera.','2025-04-28 10:20:18',3,11),
(7,'L’alternance est une excellente option !','2025-04-28 11:12:07',3,14),
(8,'Contacte-moi en MP si tu veux en discuter.','2025-04-28 11:45:56',3,15),
(9,'Pôle Emploi propose des ateliers gratuits.','2025-04-28 12:30:14',3,1),
(10,'Quels sont tes centres d’intérêt principaux ?','2025-04-28 13:22:39',3,3),
(11,'Les métiers de la santé sont très porteurs.','2025-04-28 14:10:28',3,9),
(12,'N’hésite pas à visiter des salons professionnels.','2025-04-28 15:05:17',3,10),
(13,'As-tu déjà envisagé l’étranger ?','2025-04-28 16:18:42',3,11),
(14,'Les écoles d’ingénieurs ont de bonnes passerelles.','2025-04-28 17:03:55',3,14),
(15,'Je suis passé par là, ça peut être stressant...','2025-04-28 18:20:30',3,15),
(16,'Lis \"Réussir son orientation\" de Martin Cohen.','2025-04-28 19:11:24',3,1),
(17,'Bon courage dans tes recherches !','2025-04-28 20:05:19',3,3);
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ConnectionRequest`
--

LOCK TABLES `ConnectionRequest` WRITE;
/*!40000 ALTER TABLE `ConnectionRequest` DISABLE KEYS */;
INSERT INTO `ConnectionRequest` VALUES
(1,3,1,'accepted','2025-04-27 09:55:31'),
(2,3,9,'accepted','2025-04-27 13:04:09'),
(3,9,1,'accepted','2025-04-27 16:24:19'),
(4,1,9,'pending','2025-04-28 08:10:33'),
(5,9,10,'accepted','2025-04-28 08:45:12'),
(6,10,11,'rejected','2025-04-28 09:20:47'),
(7,11,14,'pending','2025-04-28 10:15:28'),
(8,14,15,'accepted','2025-04-28 11:30:55'),
(9,15,1,'pending','2025-04-28 12:40:16'),
(10,3,10,'accepted','2025-04-28 13:25:39'),
(11,10,14,'pending','2025-04-28 14:50:22'),
(12,14,3,'rejected','2025-04-28 15:35:44'),
(13,3,11,'accepted','2025-04-28 16:20:18'),
(14,11,15,'pending','2025-04-28 17:45:57'),
(15,15,9,'accepted','2025-04-28 18:30:06'),
(16,9,14,'rejected','2025-04-28 19:15:29'),
(17,14,10,'pending','2025-04-28 20:05:48'),
(18,10,3,'accepted','2025-04-28 21:10:37');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Connexion`
--

LOCK TABLES `Connexion` WRITE;
/*!40000 ALTER TABLE `Connexion` DISABLE KEYS */;
INSERT INTO `Connexion` VALUES
(1,'2025-04-27 09:56:17',3,1),
(2,'2025-04-27 15:20:51',3,9),
(3,'2025-04-27 16:24:58',9,1),
(4,'2025-04-28 08:12:45',1,9),
(5,'2025-04-28 08:47:30',9,10),
(6,'2025-04-28 09:55:21',10,11),
(7,'2025-04-28 10:18:33',11,14),
(8,'2025-04-28 11:33:49',14,15),
(9,'2025-04-28 12:42:05',15,1),
(10,'2025-04-28 13:28:14',3,10),
(11,'2025-04-28 14:52:27',10,14),
(12,'2025-04-28 15:38:55',14,3),
(13,'2025-04-28 16:22:40',3,11),
(14,'2025-04-28 17:48:12',11,15),
(15,'2025-04-28 18:32:24',15,9),
(16,'2025-04-28 19:18:36',9,14),
(17,'2025-04-28 20:08:53',14,10),
(18,'2025-04-28 21:12:45',10,3);
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
(7,'YO POTO','2025-04-27 16:25:05',1,9),
(8,'Salut, ça va ?','2025-04-28 08:15:22',1,9),
(9,'Oui et toi ?','2025-04-28 08:16:05',9,1),
(10,'Tu as vu le dernier post de Théo ?','2025-04-28 09:30:44',10,11),
(11,'Je cherche une alternance en informatique.','2025-04-28 10:20:33',11,14),
(12,'L’EFREI est une bonne école pour ça.','2025-04-28 11:35:17',14,11),
(13,'Peux-tu me recommander à ton entreprise ?','2025-04-28 12:45:28',15,1),
(14,'Je t’envoie le lien de leur site.','2025-04-28 13:30:39',3,10),
(15,'Merci pour ton aide !','2025-04-28 14:55:42',10,3),
(16,'Tu viens à la conférence demain ?','2025-04-28 15:40:18',14,3),
(17,'Oui, à 14h !','2025-04-28 16:25:53',3,14),
(18,'On se voit là-bas alors.','2025-04-28 17:50:29',11,15),
(19,'Ça marche !','2025-04-28 18:35:47',15,11),
(20,'Tu connais des bonnes formations en IA ?','2025-04-28 19:20:12',9,14),
(21,'Regarde le parcours de DeepLearning.AI.','2025-04-28 20:10:38',14,9),
(22,'Super, merci !','2025-04-28 21:15:20',9,14);
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
  UNIQUE KEY `unique_author_ecole` (`AuthorID`,`EcoleID`),
  KEY `EcoleID` (`EcoleID`),
  CONSTRAINT `Note_ibfk_1` FOREIGN KEY (`AuthorID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Note_ibfk_2` FOREIGN KEY (`EcoleID`) REFERENCES `Utilisateur` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Note`
--

LOCK TABLES `Note` WRITE;
/*!40000 ALTER TABLE `Note` DISABLE KEYS */;
INSERT INTO `Note` VALUES
(1,4,'bonne école ',13,13),
(3,5,'Vraiment la meilleure école d\'ingénieure du monde !',3,12),
(4,3,'correct.',3,13),
(47,4,'Bonne pédagogie.',1,12),
(48,3,'Campus un peu vieillot.',9,12),
(49,4,'Professeur·es accessibles.',10,13),
(50,2,'Manque de diversité dans les cours.',11,12),
(51,5,'Vraiment top pour l’international !',14,13),
(52,4,'Bon réseau alumni.',15,12),
(53,3,'Administration lente.',1,13),
(54,4,'Ambiance étudiante géniale.',9,13),
(55,1,'Déçu par les infrastructures.',10,12),
(56,5,'Formation en cybersécurité au top.',11,13),
(57,4,'Double diplômes intéressants.',14,12),
(58,3,'Cher pour ce que c’est.',15,13);
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
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Publication`
--

LOCK TABLES `Publication` WRITE;
/*!40000 ALTER TABLE `Publication` DISABLE KEYS */;
INSERT INTO `Publication` VALUES
(3,'Mon orientation','Je suis actuellement en réflexion sur mon orientation professionnelle et j’aurais vraiment besoin de vos conseils, retours d’expérience ou même de pistes à explorer !','2025-04-28 00:34:46',3,NULL),
(34,'Recherche stage en data science','Je cherche un stage de 6 mois à partir de juin. Des conseils ?','2025-04-28 08:20:15',1,NULL),
(35,'Conférence sur l’IA demain','Venez nombreux à la conférence organisée par l’ECE !','2025-04-28 09:10:33',3,NULL),
(36,'Alternance en développement web','Je propose une alternance dans mon entreprise. MP si intéressé·e.','2025-04-28 10:25:47',9,NULL),
(37,'Retour d’expérience EFREI','Je viens de finir mon parcours, posez-moi vos questions !','2025-04-28 11:40:12',10,NULL),
(38,'Quel langage apprendre en 2025 ?','Python, JavaScript, Rust... Vous recommandez quoi ?','2025-04-28 12:50:28',11,NULL),
(39,'Projet open-source cherche contributeurs','On développe une app éducative. Rejoignez-nous !','2025-04-28 13:35:44',14,NULL),
(40,'Résultats d’admission','Je suis pris à l’INSA Rennes !','2025-04-28 14:45:19',15,NULL),
(41,'Atelier CV avec Pôle Emploi','Je partage mes notes de l’atelier de ce matin.','2025-04-28 15:55:37',1,NULL),
(42,'Qui connaît Simplon.co ?','Des retours sur leurs formations intensives ?','2025-04-28 16:30:52',3,NULL),
(43,'Stage à l’étranger : conseils','Je vise l’Allemagne ou le Canada. Des tips ?','2025-04-28 17:20:08',9,NULL),
(44,'Métiers de la green tech','Quelles compétences développer pour ce secteur ?','2025-04-28 18:15:23',10,NULL),
(45,'Réorientation à 30 ans','Est-ce possible de se lancer dans l’informatique ?','2025-04-28 19:05:41',11,NULL),
(46,'Quel laptop pour les études ?','Budget 1000€, je prends quoi ?','2025-04-28 20:25:56',14,NULL),
(47,'EFREI vs ECE','Vous choisiriez laquelle et pourquoi ?','2025-04-28 21:10:14',15,NULL),
(48,'Réseautage efficace','Comment bien utiliser LinkedIn ?','2025-04-28 22:00:33',1,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
(13,'ECE','$2b$10$sGCRLSxa5K3hwGW8TV9g2OPInJ6gnFzjYrK7kt3VfA910EJLhb.vu','ece@ece.fr','ecole','/uploads/image-1745788452464-808756448.jpg','/uploads/image-1745788449529-12185298.png','L\'ECE (École Centrale d\'Électronique) est une école d\'ingénieurs fondée en 1919 à Paris, spécialisée dans l’électronique, l’informatique, les télécommunications et l’intelligence artificielle. Elle offre une formation multidisciplinaire avec une forte ouverture internationale et des liens étroits avec l\'industrie. L\'école prépare ses étudiants à des carrières dans des secteurs technologiques variés, avec un accent sur l\'innovation et l\'insertion professionnelle.'),
(14,'Epita','$2b$10$tCax7gnY5tWSVz56tTaYxOqTByVhVttxyJiVGoKlJ777JgNZ8nOVC','epita@epita.fr','etudiant',NULL,NULL,NULL),
(15,'Insa Rennes','$2b$10$xHwDl2Q0.UYCubxBl5Uvoebl.LP4fvwlfByBfG7OFgGE0lrVsyzDm','insarennes@insa.fr','etudiant',NULL,NULL,NULL);
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

-- Dump completed on 2025-04-28  1:04:11
