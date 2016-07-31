# hipermedia

Se ha desarrollado usando bower y polymer, la información de las apis de spotify, last.fm y echonest. 
(Practica Universitaria)
Clipper Music es un sitio web de música que ofrece música limitada si no se suscribe a spotify (no implementado), con una estructura de página única (SPA). Al cargar nos ofrece recomendaciones, como las canciones top, artistas o álbumes de rock, las canciones son escuchables, artistas y álbumes explorables. En el lateral tenemos el buscador, un pequeño menú para la vuelta a la home y los datos guardados por el usuario, y el sitio donde se situará el reproductor en el momento en que clicamos sobre una canción o buscamos un artista, canción o álbum, que entonces se colocará una lista de reproducción del artista buscado. 
Al buscar nos aparecen en el contenedor principal tres pestañas con los artistas posibles para la búsqueda realizada, álbumes y canciones coincidentes con la búsqueda. Las pestañas álbumes y artistas son explorables y la de canciones podemos clicar y escucharlas.
Explorar álbumes es simplemente acceder al contenido de estos y poder reproducir las canciones. Explorar artistas nos aparecen otras tres pestañas, página del artista con la biografía, imagen, top canciones(reproducibles), álbumes y singles(explorables). La siguiente pestaña se trata de los artistas similares al seleccionado, también explorables. Y por último la pestaña playlists relacionadas con el artista en cuestión (No explorables requiere de autentificación).
Cada reproducción es registrada en el apartado playlist, en el menú lateral, usando localstorage, si accedemos luego de reproducir unas cuantas canciones tendremos allí las canciones que hemos reproducido hasta el momento, aunque se cierre el navegador quedan registradas. Esas canciones además de poder ser escuchadas y eliminadas también podemos seleccionarlas como favoritas o deseleccionarlas, así aparecerán o desaparecerán del apartado de favoritos ubicado el menú lateral.