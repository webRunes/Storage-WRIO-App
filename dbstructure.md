User profiles db creation statement

DROP TABLE IF EXISTS `webRunes_Login`.`user_profiles`;
CREATE TABLE  `webRunes_Login`.`user_profiles` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `temporary` int(11) DEFAULT NULL,
  `expire_date` bigint(11) DEFAULT NULL,
  `session` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=998712961911 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;