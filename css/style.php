<?php
/*** set the content type header ***/
/*** Without this header, it wont work ***/
header("Content-type: text/css");


$font_family = 'Klavika Basic';
?>

html, body {
  margin: 0;
  padding: 0;
  background-color: #373942;
  font-family: <?=$font_family?>;
}
