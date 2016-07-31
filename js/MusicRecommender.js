

function MusicRecommender() {

    jQuery.ajaxSettings.traditional = true;
    var config = getConfig();

    var pages = document.querySelector('#search');
    var tabs = document.querySelector('#pestanyes');
    var pagesArtist = document.querySelector('#searchArtist');
    var tabsArtist = document.querySelector('#pestanyesArtista');

    tabs.addEventListener('iron-select', function () {
        pages.selected = tabs.selected;
    });

    tabsArtist.addEventListener('iron-select', function () {
        pagesArtist.selected = tabsArtist.selected;
    });


function fetchArtistPlaylist(artist, wandering, variety) {
    var url = config.echoNestHost + 'api/v4/playlist/static';
    $("#all_resultsList").empty();
    infoList("Creating the playlist ...");
    $.getJSON(url, {
            'artist': artist,
            'api_key': config.apiKey,
            'bucket': ['id:' + config.spotifySpace, 'tracks'], 'limit': true,
            'variety': 1, 'results': 40
        })
        .done(function (data) {
            infoList("");
            if (!('songs' in data.response)) {
                infoList("Can't find that artist");
            } else {
                var title = "Artist radio for " + artist;
                console.log("aqui mirem la data del player",data.response.songs);
                getSpotifyPlayer(data.response.songs, function (player) {
                    console.log('got the player');
                    $("#all_resultsList").append(player);
                });
            }
        })
        .error(function () {
            infoList("Whoops, had some trouble getting that playlist");
        });
}

function newArtistList(artistName) {
    if(!artistName) {
        artistName = $("#artist").val();

    }

    fetchArtistPlaylist(artistName, false, .2);
}

function infoList(txt) {
    $("#infoList").text(txt);
}

function fetchSimilarArtists(artist, callback) {
    var url = config.echoNestHost + 'api/v4/artist/similar';
    $("#all_results").empty();
    info("Getting similar artists ...");
    $.getJSON(url, {
            'api_key': config.apiKey,
            'id': artist.id,
            'bucket': ['id:' + config.spotifySpace],
            'limit': true,
        })
        .done(function (data) {
            info("");
            if (data.response.status.code == 0 && data.response.artists.length > 0) {
                callback(data.response.artists);
            } else {
                info("No similars for " + artist.name);
            }
        })
        .error(function () {
            info("Whoops, had some trouble getting that playlist");
        });

}

function fetchSpotifyImagesForArtists(artists, callback) {
    info("Fetching spotify images for artists ...");
    console.log('fetchSpotifyImagesForArtists');
    var fids = [];
    artists.forEach(function (artist) {
        fids.push(fidToSpid(artist.foreign_ids[0].foreign_id));
    });

    $.getJSON("https://api.spotify.com/v1/artists/", {'ids': fids.join(',')})
        .done(function (data) {
            data.artists.forEach(function (sartist, which) {
                artists[which].spotifyArtistInfo = sartist;
            });
            callback(artists);
        })
        .error(function () {
            info("Whoops, had some trouble getting that playlist");
        });
}

function showArtists(seed, similars) {
    info("");
    console.log('show artists', seed, similars);
    showSimilars(seed, similars);
}

function showSimilars(seed, similars) {
    var div = $("<div>");

    div.addClass('similars');
    similars.forEach(function (similar) {

        var simDiv = getArtistDiv(similar);
        if (simDiv) {
            div.append(simDiv);
        }
    });
    $("#all_results").append(div);
}

function getArtistDiv(artist) {
    var image = getBestImage(artist.spotifyArtistInfo.images, 350);

    if (image) {
        var adiv = $("<paper-button>");
        adiv.addClass("customCardPlaylists");

        var updiv = $("<paper-card>");
        updiv.addClass("customCardP");

        updiv.attr('id', 'Boxes');

        var imgContenidor = $("<div>");
        imgContenidor.addClass('cropPlaylists');

        var img = $("<img>");
        img.attr('src', image.url);
        img.attr('align', "middle");

        img.addClass('imatgeArtista');

        imgContenidor.append(img);
        updiv.append(imgContenidor);

        var title = $("<div>").text(artist.name);
        var artistId = artist.spotifyArtistInfo.id;
        title.addClass('card-content');
        updiv.append(title);
        adiv.append(updiv);

        adiv.on('click', function () {
            var artist_name = title.text();
            carregaArtista(artist_name, artistId);
            //newArtistList(artist_name);

            $('#nomArtista').text(artist_name);
            $('#nomArtistaPestanya').text(artist_name);
        });
        return adiv;
    } else {
        return null;
    }

}

function getBestImage(images, minSize) {
    var best = null;
    if (images.length > 0) {
        best = images[0];
        images.forEach(
            function (image) {
                if (image.width >= minSize) {
                    best = image;
                }
            }
        );
    }
    return best;
}

function searchArtist(name, callback) {
    var url = config.echoNestHost + 'api/v4/artist/search';
    $("#all_results").empty();
    info("Searching for artists ...");
    $.getJSON(url, {
            'api_key': config.apiKey,
            'name': name,
            'bucket': ['id:' + config.spotifySpace],
            'limit': true,
        })
        .done(function (data) {
            info("");
            callback(data);
        })
        .error(function () {
            info("Whoops, had some trouble finding that artist");
        });
}

function newArtist(artist_name) {

    searchArtist(artist_name, function (data) {

        if (data.response.status.code == 0 && data.response.artists.length > 0) {
            var seed = data.response.artists[0];

            fetchSpotifyImagesForArtists([seed], function (seeds) {
                fetchSimilarArtists(seeds[0], function (similars) {
                    fetchSpotifyImagesForArtists(similars, function (similars) {
                        showArtists(seed, similars);
                    });
                });
            });
        } else {
            info("Can't find that artist");
        }

    });
}

function info(txt) {
    $("#info").text(txt);
}

function search() {
    $("#artist").on('keydown', function (e) {

        if (e.keyCode == 13) {
            e.preventDefault();
            newArtistList();
            carrega();
        }
    });
    $("#go").on("click", function () {

        carrega();
        newArtistList();
    });

}

$(document).ready(function () {
    search();
    carregaHome();

});

    $("#toggle").on("click", function _toggle() {
            var moreInfo = document.getElementById('more-info');
            var iconButton = Polymer.dom(event).localTarget;
            iconButton.icon = moreInfo.opened ? 'icons:expand-more'
                : 'icons:expand-less';
            moreInfo.toggle();

    });

    function carregaArtista(artist_name, artistId){

        var sGetItem = "https://api.spotify.com/v1/search?q="+artist_name+"&type=track,artist,playlist,album&market=US";
        var sGetItemAlbus = "https://api.spotify.com/v1/artists/"+artistId+"/albums";
        var sGetItemTopTracks = "https://api.spotify.com/v1/artists/"+artistId+"/top-tracks?country=ES";
        var $playlistsSelect = $("#lists");
        var $albumsSelect = $("#ArtistaAlbums");
        var $SinglesSelect = $("#ArtistaSingles");
        var $tracksSelect = $("#ArtistaTopTracks");

        $('#searchArtist').show();
        $('#toolbar_pestanyesArtista').show();
        $('#toolbar_pestanyes').hide();
        $('#homeTop').hide();
        $('#search').hide();
        $("#primer_toolbar").hide();
        $("#sOptionsArtistsSearch").remove();
        $("#sOptionsAlbumsSearch").remove();
        $("#sOptionsTracksSearch").remove();

        newArtist(artist_name);

        $.ajax({
            type : 'POST',
            url : 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist='+artist_name+'&format=json&api_key=2c1097b083f04b0ceafc164bb142a27a',
            data : 'method=artist.getinfo&artist='+artist_name+
            'api_key=2c1097b083f04b0ceafc164bb142a27a' +
            'format=json',
            dataType : 'jsonp',
            success : function(data) {
                console.log('eeeeeeoooooo', data);
                var infoArtist = data.artist;

                $("#infoArtist").empty();
                $("#infoArtist").text(infoArtist.bio.summary);
                $("#more-info").text(infoArtist.bio.content);
                $("#bioContent").attr('image', infoArtist.image[4]["#text"]);
            }
        });

        $.ajax({
            url: sGetItemTopTracks,
            dataType: "json",
            success: function( oDataReceived ) {
                var aTracks = oDataReceived.tracks;
                var oCurrentTrack;
                var sItems = $("<div>");

                $tracksSelect.empty();
                $.each(aTracks, function (index, value) {
                    oCurrentTrack = value;
                    console.log("top tracks", oCurrentTrack );
                    var image =  getBestImage(oCurrentTrack.album.images, 350);
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardTracks");
                        updiv.attr('id', 'trackButt');

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'trackBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('cropPlaylists');

                        var img = $("<img>");
                        img.attr('src', image.url);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentTrack.name);
                        title.addClass('card-content');
                        adiv.append(title);

                        var tracking = oCurrentTrack;

                        adiv.on("click", function () {
                            $(".sp-player").remove();
                            insertarPlaylist(tracking.id,tracking, tracking.artists[0].name, image.url, oCurrentTrack.album.name, null);
                            getPlayerNormal(tracking, null, tracking.album.name, null, function (player) {
                             console.log('got the player');
                             $("#all_resultsList").append(player);
                             });
                        });

                        updiv.append(adiv);
                    }
                    sItems.append(updiv);
                });
                $tracksSelect.append(sItems);
            }
        });

        $.ajax({
            url: sGetItemAlbus,
            dataType: "json",
            success: function( oDataReceived ) {

                var aAlbums = oDataReceived.items;
                var oCurrentAlbum;
                var sOptionsAlbums = $("<div>");
                var sOptionsSingles = $("<div>");

                $albumsSelect.empty();
                $SinglesSelect.empty();
                $.each(aAlbums, function (index, value) {
                    oCurrentAlbum = value;

                    var image =  getBestImage(oCurrentAlbum.images, 350);
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardAlbums");

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'albumBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('cropAlbums');

                        var img = $("<img>");
                        img.attr('src', image.url);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentAlbum.name);
                        title.addClass('card-content');
                        adiv.append(title);

                        var album = oCurrentAlbum;

                        adiv.on("click", function () {

                            var artist_name = title.text();

                            carregaAlbumArt(album, image.url);

                            $('#nomArtista').text(artist_name);
                            $('#bioContent').hide();
                            $('#ArtistaTopTracks').hide();
                            $('#ArtistaAlbums').hide();
                            $('#ArtistaSingles').hide();
                            $('#topTracksTitle').hide();
                            $('#AlbumsTitle').hide();
                            $('#singlesTitle').hide();
                            $('#albumSongsArt').show();
                        });

                        updiv.append(adiv);
                    }
                    if(oCurrentAlbum.album_type == "single") {

                        sOptionsSingles.append(updiv);
                    }else{
                        sOptionsAlbums.append(updiv);
                    }
                });
                $SinglesSelect.append(sOptionsSingles);
                $albumsSelect.append(sOptionsAlbums);
            }
        });

        $.ajax({
            url: sGetItem,
            dataType: "json",
            success: function( oDataReceived ) {
                var aPlayList = oDataReceived.playlists.items;
                var oCurrentPList;
                var sPlayList = $("<div>");

                $("#lists").empty();
                $.each(aPlayList, function (index, value) {
                    oCurrentPList = value;
                    console.log("Play lists", oCurrentPList );
                    var image =  getBestImage(oCurrentPList.images, 350);
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardAlbums");

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'albumBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('cropAlbums');

                        var img = $("<img>");
                        img.attr('src', image.url);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentPList.name);
                        title.addClass('card-content');
                        adiv.append(title);
                        updiv.append(adiv);
                    }
                    sPlayList.append(updiv);
                });
                $playlistsSelect.append(sPlayList);
            }
        });
    }

    function carrega() {

        var $artistsSelect = $("#artists");
        var $albumsSelect = $("#albums");
        var $tracksSelect = $("#tracks");

        var $input = $("form input");
        var sArtistToFind = $input.val();
        var sGetItem = "https://api.spotify.com/v1/search?q=" + sArtistToFind + "&type=track,artist,playlist,album&market=US";
        $('#primer_toolbar').hide();
        $("#toolbar_pestanyesArtista").hide();
        $('#toolbar_pestanyes').show();
        $('#homeTop').hide();
        $("#sOptions").remove();
        $("#sOptionsArtists").remove();
        $("#sOptionsAlbums").remove();
        $('#search').show();
        $('#searchArtist').hide();

        $.ajax({
            url: sGetItem,
            dataType: "json",
            success: function (oDataReceived) {

                var aArtists = oDataReceived.artists.items;
                var oCurrentArtist;
                var sOptions = $("<div>");
                sOptions.attr("id", "sOptionsArtistsSearch");

                $("#artists").empty();
                $.each(aArtists, function (index, value) {
                    oCurrentArtist = value;

                    console.log('mirant', oDataReceived);
                    var image =  getBestImage(oCurrentArtist.images, 350);
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardPlaylists");
                        updiv.attr('id', 'artistaButt');

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");

                        adiv.attr('id', 'Boxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('cropPlaylists');

                        var img = $("<img>");
                        img.attr('src', image.url);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentArtist.name);
                        title.attr('id', 'name_artist');
                        title.addClass('card-content');
                        adiv.append(title);

                        var artistId = oCurrentArtist.id;

                        adiv.on("click", function () {
                            var artist_name = title.text();
                            carregaArtista(artist_name, artistId);
                            //newArtistList(artist_name);
                            $('#nomArtista').text(artist_name);
                            $('#nomArtistaPestanya').text(artist_name);
                        });
                        updiv.append(adiv);
                    }
                    sOptions.append(updiv);
                });
                $artistsSelect.append(sOptions);
            }
        });

        $.ajax({
            url: sGetItem,
            dataType: "json",
            success: function( oDataReceived ) {

                var aAlbums = oDataReceived.albums.items;
                var oCurrentAlbum;
                var sOptionsAlbums = $("<div>");
                sOptionsAlbums.attr("id", "sOptionsAlbumsSearch");

                $("#albums").empty();
                $.each(aAlbums, function (index, value) {
                    oCurrentAlbum = value;

                    var image =  getBestImage(oCurrentAlbum.images, 350);
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardAlbums");

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'albumBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('cropAlbums');

                        var img = $("<img>");
                        img.attr('src', image.url);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentAlbum.name);
                        title.addClass('card-content');
                        adiv.append(title);

                        var album = oCurrentAlbum;

                        adiv.on("click", function () {
                            var artist_name = title.text();
                            carregaAlbum(album, image.url);

                            $('#nomAlbum').text(artist_name);
                            $('#albums').hide();
                            $('#albumSongs').show();
                        });

                        updiv.append(adiv);
                    }
                    sOptionsAlbums.append(updiv);
                });
                $albumsSelect.append(sOptionsAlbums);
            }
        });

        $.ajax({
            url: sGetItem,
            dataType: "json",
            success: function( oDataReceived ) {
                var aTracks = oDataReceived.tracks.items;
                var oCurrentTrack;
                var sItems = $("<div>");
                sItems.attr("id", "sOptionsTracksSearch");

                $("#tracks").empty();
                $.each(aTracks, function (index, value) {
                    oCurrentTrack = value;

                    var image =  getBestImage(oCurrentTrack.album.images, 350);
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardTracks");
                        updiv.attr('id', 'trackBoxes');

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'trackBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('cropPlaylists');

                        var img = $("<img>");
                        img.attr('src', image.url);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentTrack.name);
                        title.addClass('card-content');
                        adiv.append(title);

                        var tracking = oCurrentTrack;

                        adiv.on("click", function () {
                            $(".sp-player").remove();
                            insertarPlaylist(tracking.id,tracking, tracking.artists[0].name, image.url, oCurrentTrack.album.name, null);
                            getPlayerNormal(tracking, null, oCurrentTrack.album.name, null, function (player) {
                                console.log('got the player');
                                $("#all_resultsList").append(player);
                            });
                        });

                        updiv.append(adiv);
                    }
                    sItems.append(updiv);
                });
                $tracksSelect.append(sItems);
            }
        });
    }

    function carregaHome(){


        var $trackTopHome = $("#Release");

        $.ajax({
            type : 'POST',
            url : 'http://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=spain&limit=5&format=json&api_key=2c1097b083f04b0ceafc164bb142a27a',
            data : 'method=geo.gettoptracks&country=spain&limit=5' +
            'api_key=2c1097b083f04b0ceafc164bb142a27a' +
            'format=json',
            dataType : 'jsonp',
            success : function(data) {
                console.log("TopHomeTracks",data);
                var topTrack = data.tracks.track;
                var oCurrentTrack;
                var sOptions = $("<div>");
                sOptions.attr("id", "sOptions");
                $("#Release").empty();
                $.each(topTrack, function (index, value) {
                    oCurrentTrack = value;
                    console.log('mirant', data);
                    var image =  oCurrentTrack.image[2]["#text"];
                    if (image) {
                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardTracks");

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'trackBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('crop');

                        var img = $("<img>");
                        img.attr('src', image);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentTrack.name);
                        title.addClass('card-content');
                        adiv.append(title);

                        var sGetItem = "https://api.spotify.com/v1/search?q="+oCurrentTrack.name+"&type=track&market=ES&limit=1&offset=0";
                        var tracking;
                        $.ajax({
                            url: sGetItem,
                            dataType: "json",
                            success: function( oDataReceived ) {
                                tracking = oDataReceived.tracks.items[0];
                            }
                        });


                        adiv.on("click", function () {
                            $(".sp-player").remove();
                            insertarPlaylist(tracking.id,tracking, tracking.artists[0].name, getBestImage(tracking.album.images, 300).url, tracking.album.name, null);
                            getPlayerNormal(tracking, null, tracking.album.name, null, function (player) {
                                console.log('got the player');
                                $("#all_resultsList").append(player);
                            });
                        });

                        updiv.append(adiv);
                    }
                    sOptions.append(updiv);
                });
                $trackTopHome.append(sOptions);
            }
        });

        var $artistTopHome = $('#artistTop');
        $.ajax({
            type : 'POST',
            url : 'http://ws.audioscrobbler.com/2.0/?method=geo.gettopartists&country=spain&limit=5&format=json&api_key=2c1097b083f04b0ceafc164bb142a27a',
            data : 'method=geo.gettopartists&country=spain&limit=5' +
            'api_key=2c1097b083f04b0ceafc164bb142a27a' +
            'format=json',
            dataType : 'jsonp',
            success: function (data) {
                console.log(data);
                console.log("eeeeieieiiieieiei");
                var topArtist = data.topartists.artist;
                var oCurrentArtist;
                var sOptions = $("<div>");
                sOptions.attr("id", "sOptionsArtists");
                $artistTopHome.empty();
                $.each(topArtist, function (index, value) {
                    oCurrentArtist = value;
                    console.log('mirant', data);
                    var image =  oCurrentArtist.image[3]["#text"];
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardPlaylists");

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'Boxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('crop');

                        var img = $("<img>");
                        img.attr('src', image);
                        img.attr('role', 'button');

                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentArtist.name);
                        title.addClass('card-content');
                        adiv.append(title);


                        var sGetItem = "https://api.spotify.com/v1/search?q="+oCurrentArtist.name+"&type=artist&market=ES";
                        var artistId;
                        $.ajax({
                            url: sGetItem,
                            dataType: "json",
                            success: function( oDataReceived ) {
                                artistId = oDataReceived.artists.items[0].id;
                            }
                        });

                        adiv.on("click", function () {
                            var artist_name = title.text();
                            carregaArtista(artist_name, artistId);
                            //newArtistList(artist_name);
                            $('#nomArtista').text(artist_name);
                            $('#nomArtistaPestanya').text(artist_name);
                        });
                        updiv.append(adiv);
                    }
                    sOptions.append(updiv);
                });
                $artistTopHome.append(sOptions);
            }
        });

        var $discoTopHome = $("#recom");

        $.ajax({
            type : 'POST',
            url : 'http://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=rock&limit=5&format=json&api_key=2c1097b083f04b0ceafc164bb142a27a',
            data :
            'method=tag.gettopalbums&tag=rock&limit=5' +
            'api_key=2c1097b083f04b0ceafc164bb142a27a' +
            'format=json',
            dataType : 'jsonp',
            success: function (data) {
                console.log(data);
                var newRelease = data.albums.album;
                var oCurrentRelease;
                var sOptions = $("<div>");
                sOptions.attr("id", "sOptionsAlbums");
                $("#recom").empty();
                $.each(newRelease, function (index, value) {
                    oCurrentRelease = value;
                    console.log('mirant', data);
                    var image =  oCurrentRelease.image[3]["#text"];
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardAlbums");

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'albumBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('crop');

                        var img = $("<img>");
                        img.attr('src', image);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentRelease.name);
                        title.addClass('card-content');
                        adiv.append(title);

                        var sGetItem = "https://api.spotify.com/v1/search?q="+oCurrentRelease.name+"&type=album&market=ES&limit=1";
                        var tracking;
                        $.ajax({
                            url: sGetItem,
                            dataType: "json",
                            success: function( oDataReceived ) {
                                tracking = oDataReceived.albums;
                                console.log("tracking albums recom", tracking);
                            }
                        });

                        adiv.on("click", function () {

                            carregaAlbumRecomend(tracking, tracking.items[0].images[1].url);

                            $('#homeAlbumsRecomend').text(tracking.items[0].name);
                            $('#Release').hide();
                            $('#artistTop').hide();
                            $('#recom').hide();
                            $('#artistTopTitle').hide();
                            $('#recomTitle').hide();
                            $('#albumsRecomend').show();
                        });
                        updiv.append(adiv);
                    }
                    sOptions.append(updiv);
                });
                $discoTopHome.append(sOptions);
            }
        });
    }


    function carregaAlbum(album, albumImage){

        var $albumSongs = $("#albumSongs");
        var sGetTracksFromAlbum = "https://api.spotify.com/v1/albums/"+album.id+"/tracks?market=ES";
        var tracksFromAlbum;

        $.ajax({
            url: sGetTracksFromAlbum,
            dataType: "json",
            success: function( oDataReceived ) {
                console.log("Albums Tracks", oDataReceived);
                tracksFromAlbum = oDataReceived.items;

                var oCurrentTrack;
                var sItems = $("<div>");
                sItems.attr("id", "sOptionsTracksSearch");

                $albumSongs.empty();
                $.each(tracksFromAlbum, function (index, value) {
                    oCurrentTrack = value;

                    var image =  albumImage;
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardTracks");
                        updiv.attr('id', 'trackBoxes');

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'trackBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('cropPlaylists');

                        var img = $("<img>");
                        img.attr('src', albumImage);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);

                        var title = $("<div>").text(oCurrentTrack.name);
                        title.addClass('card-content');
                        adiv.append(title);

                        var tracking = oCurrentTrack;

                        adiv.on("click", function () {
                            $(".sp-player").remove();
                            insertarPlaylist(tracking.id,tracking, tracking.artists[0].name, albumImage, album.name, null);
                            getPlayerNormal(tracking, albumImage, album.name, null, function (player) {
                                console.log('got the player');
                                $("#all_resultsList").append(player);

                            });
                        });

                        updiv.append(adiv);
                    }
                    sItems.append(updiv);
                });
                var buttAtras = $("<paper-icon-button>");
                buttAtras.addClass("buttAtras");
                buttAtras.attr("size", "128");
                buttAtras.attr("icon","icons:arrow-back");
                buttAtras.on("click", function () {
                    $('#albums').show();
                    $('#albumSongs').hide();
                    buttAtras.hide();
                    $('#nomAlbum').text("Albums");
                });

                $('#nomAlbum').append(buttAtras);
                $albumSongs.append(sItems);
            }
        });
    }

    function carregaAlbumArt(album, albumImage){

        var $albumSongsArt = $("#albumSongsArt");
        var sGetTracksFromAlbum = "https://api.spotify.com/v1/albums/"+album.id+"/tracks?market=ES";
        var tracksFromAlbum;
        var name_artist;

        $.ajax({
            url: sGetTracksFromAlbum,
            dataType: "json",
            success: function( oDataReceived ) {
                console.log("Albums Tracks", oDataReceived);
                tracksFromAlbum = oDataReceived.items;

                var oCurrentTrack;
                var sItems = $("<div>");
                sItems.attr("id", "sOptionsTracksSearch");

                $albumSongsArt.empty();
                $.each(tracksFromAlbum, function (index, value) {
                    oCurrentTrack = value;

                    var image =  albumImage;
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardTracks");
                        updiv.attr('id', 'trackBoxes');

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'trackBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('cropPlaylists');

                        var img = $("<img>");
                        img.attr('src', albumImage);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);
                        name_artist = oCurrentTrack.artists[0].name;
                        var title = $("<div>").text(oCurrentTrack.name);
                        title.addClass('card-content');
                        adiv.append(title);

                        var tracking = oCurrentTrack;

                        adiv.on("click", function () {
                            $(".sp-player").remove();
                            insertarPlaylist(tracking.id,tracking, tracking.artists[0].name, albumImage, album.name, null);
                            getPlayerNormal(tracking, albumImage, album.name, null, function (player) {
                                console.log('got the player');
                                $("#all_resultsList").append(player);

                            });
                        });

                        updiv.append(adiv);
                    }
                    sItems.append(updiv);
                });
                var buttAtras = $("<paper-icon-button>");
                buttAtras.addClass("buttAtras");
                buttAtras.attr("size", "128");
                buttAtras.attr("icon","icons:arrow-back");
                buttAtras.on("click", function () {
                   // $('#nomArtista').text(artist_name);
                    $('#bioContent').show();
                    $('#ArtistaTopTracks').show();
                    $('#ArtistaAlbums').show();
                    $('#ArtistaSingles').show();
                    $('#topTracksTitle').show();
                    $('#AlbumsTitle').show();
                    $('#singlesTitle').show();
                    $albumSongsArt.hide();
                    buttAtras.hide();
                    $('#nomArtista').text(name_artist);
                });

                $('#nomArtista').append(buttAtras);
                $albumSongsArt.append(sItems);
            }
        });
    }

    function carregaAlbumRecomend(album, albumImage){

        var $albumsRecomend = $("#albumsRecomend");
        var sGetTracksFromAlbum = "https://api.spotify.com/v1/albums/"+album.items[0].id+"/tracks?market=ES";
        var tracksFromAlbum;
        var name_artist;

        $.ajax({
            url: sGetTracksFromAlbum,
            dataType: "json",
            success: function( oDataReceived ) {
                console.log("Albums Tracks", oDataReceived);
                tracksFromAlbum = oDataReceived.items;

                var oCurrentTrack;
                var sItems = $("<div>");
                sItems.attr("id", "sOptionsTracksSearch");

                $albumsRecomend.empty();
                $.each(tracksFromAlbum, function (index, value) {
                    oCurrentTrack = value;

                    var image =  albumImage;
                    if (image) {

                        var updiv = $("<paper-button>");
                        updiv.addClass("customCardTracks");
                        updiv.attr('id', 'trackBoxes');

                        var adiv = $("<paper-card>");
                        adiv.addClass("customCardP");
                        adiv.attr('id', 'trackBoxes');

                        var imgContenidor = $("<div>");
                        imgContenidor.addClass('cropPlaylists');

                        var img = $("<img>");
                        img.attr('src', albumImage);
                        img.attr('role', 'button');
                        img.addClass('imatgeArtista');
                        imgContenidor.append(img);
                        adiv.append(imgContenidor);
                        name_artist = oCurrentTrack.artists[0].name;
                        var title = $("<div>").text(oCurrentTrack.name);
                        title.addClass('card-content');
                        adiv.append(title);

                        var tracking = oCurrentTrack;

                        adiv.on("click", function () {
                            $(".sp-player").remove();
                            console.log("aqui mirem la data el buto de track",oCurrentTrack);
                            insertarPlaylist(tracking.id,tracking, tracking.artists[0].name, albumImage, album.items[0].name, null);
                            getPlayerNormal(tracking, albumImage, album.items[0].name, null, function (player) {
                                console.log('got the player');
                                $("#all_resultsList").append(player);

                            });
                        });

                        updiv.append(adiv);
                    }
                    sItems.append(updiv);
                });
                var buttAtras = $("<paper-icon-button>");
                buttAtras.addClass("buttAtras");
                buttAtras.attr("size", "128");
                buttAtras.attr("icon","icons:arrow-back");
                buttAtras.on("click", function () {

                    $('#Release').show();
                    $('#artistTop').show();
                    $('#recom').show();
                    $('#artistTopTitle').show();
                    $('#recomTitle').show();

                    $albumsRecomend.hide();
                    buttAtras.hide();
                    $('#homeAlbumsRecomend').text("Top tracks");
                });

                $('#homeAlbumsRecomend').append(buttAtras);
                $albumsRecomend.append(sItems);
            }
        });
    }


    function insertarPlaylist ( id, tracking, artistName, albumImage, album_name, favorito) {
        if (typeof(Storage) !== "undefined") {

            var data =  albumImage+"~"+tracking.name+"~"+album_name+"~"+artistName+"~"+id+"~"+tracking.preview_url+"~"+favorito;
            var duplicate = duplicatsStorage(id);

            if(duplicate == false) {
                localStorage.setItem(localStorage.length.toString(), data);
                console.log("Elemento añadido en localStorage", data);
            }
        }else {
            console.log("El navegador no admite uso de localStorage");
        }
    }

    function removeTrackFromPlaylist (id) {
        localStorage.removeItem(id.toString());
    }

    $("#playlistLink").on("click", function () {
        var tipo = $("#homeTop");

        if( $('#search').is(":visible") ){
            tipo = $("#search");

        }else{
            if( $('#searchArtist').is(":visible") ){
                tipo = $("#searchArtist");
            }else {
                if ($('#homeTop').is(":visible")) {
                    tipo = $("#homeTop");
                }
            }
        }
        tipo.hide();
        $("#Playlist").show();
        $("#PlaylistFavorites").hide();
        $("#playlistTitle").empty();
        //reordenarStorage();
        carregaPlaylist(tipo);

    });

    $("#playlistLinkFav").on("click", function () {
        var tipo = $("#homeTop");

        if( $('#search').is(":visible") ){
            tipo = $("#search");

        }else{
            if( $('#searchArtist').is(":visible") ){
                tipo = $("#searchArtist");
            }else {
                if ($('#homeTop').is(":visible")) {
                    tipo = $("#homeTop");
                }else {
                    if ($('#Playlist').is(":visible")) {
                        tipo = $("#Playlist");
                    }
                }
            }
        }
        tipo.hide();
        $('#Playlist').hide();
        $("#PlaylistFavorites").show();

        carregaFavoritos(tipo);

    });

    function duplicatsStorage( id ){

        if (typeof(Storage) !== "undefined") {
            var aux, data;
            for (var i = 0; i < localStorage.length; i++) {

                aux = localStorage.getItem(localStorage.key(i));
                data = aux.split("~");
                console.log("aux", data[4]);
                console.log("id", id);
                if(data[4] == id){
                    return i;
                }
            }
            return false;
        }
    }

    function carregaPlaylist ($tipo) {

        if (typeof(Storage) !== "undefined") {

            var data;
            var aux;
            var sItems = $("<div>");
            sItems.attr("id", "sOptionsTracksSearch");

            var dataux;


            $("#playlistSongs").empty();
            for (var i = localStorage.length-1; i >= 0 ; i--) {
                aux = localStorage.getItem(localStorage.key(i));
                data = aux.split("~");
                console.log("Hem entrat a playlist", data);
                var image =  data[0];

                if (!image) {
                } else {

                    var adiv = $("<paper-card>");
                    adiv.addClass("customCardP");
                    adiv.attr('id', 'trackBoxes');

                    var imgContenidor = $("<div>");
                    imgContenidor.addClass('cropPlaylists');

                    var img = $("<img>");
                    img.attr('src', data[0]);
                    img.attr('role', 'button');
                    img.addClass('imatgeArtista');
                    imgContenidor.append(img);
                    adiv.append(imgContenidor);

                    var title = $("<div>").text(data[1]);
                    title.addClass('card-content');
                    adiv.append(title);

                    var actions = $("<div>");
                    actions.addClass("actions");
                    var favorite = $("<paper-icon-button>");

                    if(data[6] === "null") {
                        favorite.attr("icon", "favorite-border");
                    }else{
                        favorite.attr("icon", "favorite");
                    }
                    favorite.attr("id", "F-"+localStorage.key(i));

                    favorite.on("click", function () {
                        var ID = this.id.split("-");
                        var auxil = localStorage.getItem(ID[1]);
                        dataux = auxil.split("~");
                        var tracking = {name: dataux[1], preview_url: dataux[5]};
                        if(dataux[6] == "null") {
                            dataux[6] = "1";
                        }else{
                            dataux[6] = "null";
                        }
                        var data =  dataux[0]+"~"+tracking.name+"~"+dataux[2]+"~"+dataux[3]+"~"+dataux[4]+"~"+tracking.preview_url+"~"+dataux[6];
                        localStorage.setItem(ID[1], data);
                        carregaPlaylist($tipo);
                    });

                    var listen = $("<paper-icon-button>");
                    listen.attr("icon", "av:play-circle-outline");
                    listen.attr("id", "L-"+localStorage.key(i));

                    listen.on("click", function () {
                        $(".sp-player").remove();
                        var ID = this.id.split("-");
                        var auxil = localStorage.getItem(ID[1]);
                            dataux = auxil.split("~");
                        var tracking = {name: dataux[1], preview_url: dataux[5]};
                        var imageAl = dataux[0];
                        var nameAl = dataux[2];
                        var nameArt = dataux[3];

                        getPlayerNormal(tracking, imageAl, nameAl, nameArt, function (player) {
                            $("#all_resultsList").append(player);
                        });
                    });

                    var remove = $("<paper-icon-button>");
                    remove.attr("id", "D-"+localStorage.key(i));
                    remove.addClass('butDel');
                    remove.attr("icon", "delete");

                    remove.on("click", function () {

                        var ID = this.id.split("-");
                        removeTrackFromPlaylist(ID[1]);
                        //reordenarStorage();
                        carregaPlaylist($tipo);
                    });

                    actions.append(favorite);
                    actions.append(listen);
                    actions.append(remove);
                    adiv.append(actions);
                }
                sItems.append(adiv);
            }
        }
            var buttAtras = $("<paper-icon-button>");
            buttAtras.addClass("buttAtras");
            buttAtras.attr("size", "128");
            buttAtras.attr("icon","icons:arrow-back");
            buttAtras.on("click", function () {
                $tipo.show();
                $('#Playlist').hide();
                buttAtras.hide();

            });
            $('#playlistTitle').text("PlayList");
            $('#playlistTitle').append(buttAtras);
            $('#playlistSongs').append(sItems);
    }


    function carregaFavoritos ($tipo) {

        if (typeof(Storage) !== "undefined") {

            var data;
            var aux;
            var sItems = $("<div>");
            sItems.attr("id", "sOptionsTracksSearch");
            var dataux;


            $("#playlistSongsFav").empty();
            for (var i = localStorage.length-1; i >= 0 ; i--) {
                aux = localStorage.getItem(localStorage.key(i));
                data = aux.split("~");

                var image =  data[0];

                if(data[6] !== "null") {
                if (!image) {
                } else {

                    var adiv = $("<paper-card>");
                    adiv.addClass("customCardP");
                    adiv.attr('id', 'trackBoxes');

                    var imgContenidor = $("<div>");
                    imgContenidor.addClass('cropPlaylists');

                    var img = $("<img>");
                    img.attr('src', data[0]);
                    img.attr('role', 'button');
                    img.addClass('imatgeArtista');
                    imgContenidor.append(img);
                    adiv.append(imgContenidor);

                    var title = $("<div>").text(data[1]);
                    title.addClass('card-content');
                    adiv.append(title);

                    var actions = $("<div>");
                    actions.addClass("actions");
                    var favorite = $("<paper-icon-button>");

                    favorite.attr("icon", "favorite");

                    favorite.attr("id", "F-"+localStorage.key(i));

                    favorite.on("click", function () {
                        var ID = this.id.split("-");
                        var auxil = localStorage.getItem(ID[1]);
                        dataux = auxil.split("~");
                        var tracking = {name: dataux[1], preview_url: dataux[5]};
                        if(dataux[6] == "null") {
                            dataux[6] = "1";
                        }else{
                            dataux[6] = "null";
                        }
                        var data =  dataux[0]+"~"+tracking.name+"~"+dataux[2]+"~"+dataux[3]+"~"+dataux[4]+"~"+tracking.preview_url+"~"+dataux[6];
                        localStorage.setItem(ID[1], data);
                        carregaPlaylist($tipo);
                    });

                    var listen = $("<paper-icon-button>");
                    listen.attr("icon", "av:play-circle-outline");
                    listen.attr("id", "L-"+localStorage.key(i));

                    listen.on("click", function () {
                        $(".sp-player").remove();
                        var ID = this.id.split("-");
                        var auxil = localStorage.getItem(ID[1]);
                        dataux = auxil.split("~");
                        var tracking = {name: dataux[1], preview_url: dataux[5]};
                        var imageAl = dataux[0];
                        var nameAl = dataux[2];
                        var nameArt = dataux[3];

                        getPlayerNormal(tracking, imageAl, nameAl, nameArt, function (player) {
                            $("#all_resultsList").append(player);
                        });
                    });

                    var remove = $("<paper-icon-button>");
                    remove.attr("id", "D-"+localStorage.key(i));
                    remove.addClass('butDel');
                    remove.attr("icon", "delete");

                    remove.on("click", function () {

                        var ID = this.id.split("-");
                        removeTrackFromPlaylist(ID[1]);
                        carregaPlaylist($tipo);
                    });

                    actions.append(favorite);
                    actions.append(listen);
                    actions.append(remove);
                    adiv.append(actions);
                }
                sItems.append(adiv);
            }
        }
        var buttAtras = $("<paper-icon-button>");
        buttAtras.addClass("buttAtras");
        buttAtras.attr("size", "128");
        buttAtras.attr("icon","icons:arrow-back");
        buttAtras.on("click", function () {
            $tipo.show();
            $('#PlaylistFavorites').hide();
            buttAtras.hide();

        });
        $('#playlistTitleFav').text("Favorites");
        $('#playlistTitleFav').append(buttAtras);
        $('#playlistSongsFav').append(sItems);
    }
    }

    function getPlayerNormal(song, albumImage, albumName, artistName, callback) {
        var curSong = 0;
        var audio = null;

        var player = createPlayer();
        var playlist = null;
        var songs = [];

        songs.push(song);

        playlist = filterSongs(songs);

        showCurSong(false);
        callback(player);
        function filterSongs(songs) {
            var out = [];

            function isGoodSong(song) {
                return song.preview_url != null;
            }

            songs.forEach(function(song) {
                if (isGoodSong(song)) {
                    out.push(song);
                }
            });
            console.log("out: ", out);
            return out;
        }

        function showSong(song, autoplay) {
            if(!albumImage) {
                $(player).find(".sp-album-art").attr('src', getBestImage(song.album.images, 300).url);
            }else{
                $(player).find(".sp-album-art").attr('src', albumImage);
            }
            $(player).find(".sp-title").text(song.name);
            if(!artistName) {
                $(player).find(".sp-artist").text(song.artists[0].name);
            }else{
                $(player).find(".sp-artist").text(artistName);
            }

            $(player).find(".sp-album").text(albumName);

            audio.attr('src', song.preview_url);
            console.log("Estem dins de show song");
            if (autoplay) {
                audio.get(0).play();
            }

        }

        function getBestImage(images, maxWidth) {
            var best = images[0];
            images.reverse().forEach(
                function(image) {
                    if (image.width <= maxWidth) {
                        best = image;
                    }
                }
            );
            return best;
        }

        function showCurSong(autoplay) {
            showSong(playlist[curSong], autoplay);
        }

        function nextSong() {
            if (curSong < playlist.length - 1) {
                curSong++;
                showCurSong(true);
            } else {
            }
        }
        function getRandomIntInclusive(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        function nextSongRand() {
            if (curSong < playlist.length - 1) {
                curSong = getRandomIntInclusive(0, playlist.length-1);
                showCurSong(true);
            } else {
            }
        }

        function prevSong() {
            if (curSong > 0) {
                curSong--;
                showCurSong(true);
            }
        }

        function togglePausePlay() {
            console.log('tpp', audio.get(0).paused);
            if (audio.get(0).paused) {
                audio.get(0).play();
            } else {
                audio.get(0).pause();
            }
        }

        function PauseAll() {
            console.log('tpp', audio.get(0).paused);
            if (audio.get(0).paused) {

            } else {
                audio.get(0).pause();
            }
        }

        function createPlayer() {

            var main = $("<div class='sp-player'>");
            var img = $("<img class='sp-album-art'>");
            var info  = $("<div class='sp-info'>");
            var title = $("<div class='sp-title'>");
            var album = $("<div class='sp-album'>");
            var artist = $("<div class='sp-artist'>");
            var controls = $("<div class='btn-group sp-controls' id='playero'>");

            var next = $('<button class="btn btn-primary btn-sm" type="button"><span class="glyphicon glyphicon-forward"></span></button>');
            var prev = $('<button class="btn btn-primary btn-sm" type="button"><span class="glyphicon glyphicon-backward"></span></button>');
            var pausePlay = $('<button class="btn btn-primary btn-sm" type="button"><span class="glyphicon glyphicon-play"></span></button>');
            var randomMode = $('<button class="btn btn-primary btn-sm" type="button"><span class="glyphicon glyphicon-random"></span></button>');

            audio = $("<audio>");
            audio.on('pause', function() {
                var pp = pausePlay.find("span");
                pp.removeClass('glyphicon-pause');
                pp.addClass('glyphicon-play');
            });

            audio.on('play', function() {
                var pp = pausePlay.find("span");
                pp.attr('id', 'audioplay');
                pp.addClass('glyphicon-pause');
                pp.removeClass('glyphicon-play');
            });

            randomMode.on('click', function(){
                nextSongRand();
            });

            audio.on('ended', function() {
                console.log('ended');
                nextSong();
            });

            next.on('click', function() {
                nextSong();
            });

            pausePlay.on('click', function() {
                togglePausePlay();
            });

            prev.on('click', function() {
                prevSong();
            });

            $("#go").on("click", function () {
                PauseAll();
            });

            $("#artist").on('keydown', function (e) {

                if (e.keyCode == 13) {
                    e.preventDefault();
                    PauseAll();
                }
            });

            info.append(title);
            info.append(album);
            info.append(artist);

            controls.append(prev);
            controls.append(pausePlay);
            controls.append(next);
            controls.append(randomMode);

            main.append(img);
            main.append(info);
            main.append(controls);

            main.bind('destroyed', function() {
                console.log('player destroyed');
                audio.pause();
            });

            console.log('creem el player');
            return main;
        }
        $(document).on('click', '#trackBoxes', function(e) {
            PauseAll();
        });
        return player;
    }

}

