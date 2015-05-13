add these lines in front of a mysql dump or perform them in a script

DROP DATABASE IF EXISTS cb_phpunittest;
DELETE FROM cb__casebox.cores WHERE name='phpunittest';
CREATE DATABASE cb_phpunittest CHARACTER SET utf8 COLLATE utf8_general_ci;
USE cb_phpunittest;
