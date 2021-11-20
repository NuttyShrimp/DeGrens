var selectedChar = null;
var WelcomePercentage = "30vh"
dgChars = {}
var Loaded = false;

$(document).ready(function (){
    window.addEventListener('message', function (event) {
        var data = event.data;

        if (data.action == "ui") {
            if (data.toggle) {
                $('.container').show();
                $(".welcomescreen").fadeIn(150);
                dgChars.resetAll();

                var originalText = "Retrieving player data";
                var loadingProgress = 0;
                var loadingDots = 0;
                $("#loading-text").html(originalText);
                var DotsInterval = setInterval(function() {
                    $("#loading-text").append(".");
                    loadingDots++;
                    loadingProgress++;
                    if (loadingProgress == 3) {
                        originalText = "Validating player data"
                        $("#loading-text").html(originalText);
                    }
                    if (loadingProgress == 4) {
                        originalText = "Retrieving characters"
                        $("#loading-text").html(originalText);
                    }
                    if (loadingProgress == 6) {
                        originalText = "Validating characters"
                        $("#loading-text").html(originalText);
                    }
                    if(loadingDots == 4) {
                        $("#loading-text").html(originalText);
                        loadingDots = 0;
                    }
                }, 500);
            
                setTimeout(function(){
                    
                    setTimeout(function(){
                        clearInterval(DotsInterval);
                        loadingProgress = 0;
                        originalText = "Retrieving data";
                        $(".welcomescreen").fadeOut(150);
                        $.post('https://dg-chars/removeBlur');
                        dgChars.fadeInDown('.characters-list', '15%', 400);
                    }, 2000);
                }, 2000);
            } else {
                $('.container').fadeOut(250);
                dgChars.resetAll();
            }
        }



        if (data.action == "setupCharacters") {
            var chars = data.characters;

            for (i=0; i<5; i++){
                var charInfo = JSON.stringify(chars[i]);
                count = i+1;
                if (jQuery.isEmptyObject(chars[i]) == false){
                    $('#slot-name-'+count).text( chars[i].firstname + ' ' + chars[i].lastname);
                    $('#char-'+count).data('cid', chars[i].citizenid);
                    $('#char-'+count).data('cinfo', charInfo);
                    $('#char-'+count).data('count', count);
                } 
                else {
                    $('#char-'+count).data('count', count);
                    $('#char-'+count).data('cinfo', "empty");
                    $('#slot-name-'+count).text('Maak een karakter');
                }
            }

        }
    });

    $('.datepicker').datepicker();
});


$('.char-wrap').click(function(e){
    e.preventDefault();
    var count = ($(this).data('count'));
    var cinfo = ($(this).data('cinfo'));
    if(cinfo != "empty"){
        
        var info = JSON.parse(cinfo);
        

        selectedChar = {}
        selectedChar.id = count;
        selectedChar.citizenid = info.citizenid;
        selectedChar.firstname = info.firstname;
        selectedChar.lastname = info.lastname;
        if (info.gender == 0) {
        selectedChar.gender = "Man" ;
        } else if (info.gender == 1) {
            selectedChar.gender = "Vrouw" ;
        }
        selectedChar.job = JSON.parse(info.job);
        selectedChar.birthdate = info.birthdate;

        $('#name').text( selectedChar.firstname + ' ' + selectedChar.lastname);
        $('#citizenid').text( selectedChar.citizenid);
        $('#gender').text( selectedChar.gender);
        $('#birthdate').text( selectedChar.birthdate);
        $('#job').text( selectedChar.job.label);
        $.post('https://dg-chars/zoomToChar', JSON.stringify({
            count: count,
        }));
        $(".characters-list").fadeOut(150);
        setTimeout(function(){
            dgChars.fadeInDown('.character-info', '10%', 400);
        }, 1500);
    } else if (cinfo == "empty") {
        $.post('https://dg-chars/zoomToChar', JSON.stringify({
            count: count,
        }));
        $(".characters-list").fadeOut(150);
        setTimeout(function(){
            dgChars.fadeInDown('.character-create', '10%', 400);
        }, 1500);
    }
});

$('#back-btn').click(function(e){
    e.preventDefault();
    $.post('https://dg-chars/zoomToMain')
    selectCharacter = {}
    setTimeout(function(){
        dgChars.fadeInDown('.characters-list', '15%', 250);
    }, 1500);
    $('.character-info').fadeOut(150);
});

$('#cancel-btn').click(function(e){
    e.preventDefault();
    $.post('https://dg-chars/zoomToMain')
    setTimeout(function(){
        dgChars.fadeInDown('.characters-list', '15%', 250);
    }, 1500);
    $('.character-create').fadeOut(150);
});

$('#disconnect').click(function(e){
    e.preventDefault();

    $.post('https://dg-chars/closeUI');
    $.post('https://dg-chars/disconnect');
});

$('#play').click(function(e){
    e.preventDefault();
    $.post('https://dg-chars/play', JSON.stringify({
        citizenid: selectedChar.citizenid,
        count: selectedChar.id,
    }));
});

$(document).on('click', '#create', function (e) {
    e.preventDefault();
   
        let firstname= escapeHtml($('#first_name').val())
        let lastname= escapeHtml($('#last_name').val())
        let nationality= escapeHtml($('#nationality').val())
        let birthdate= escapeHtml($('#birthdate').val())
        let gender= escapeHtml($('select[name=gender]').val())
        
        
    //An Ugly check of null objects

    if (!firstname || !lastname || !nationality || !birthdate || hasWhiteSpace(firstname) || hasWhiteSpace(lastname)|| hasWhiteSpace(nationality) ){
    console.log("FIELDS REQUIRED")
    }else{
        $.post('https://qb-multicharacter/createNewCharacter', JSON.stringify({
            firstname: firstname,
            lastname: lastname,
            nationality: nationality,
            birthdate: birthdate,
            gender: gender,
            cid: cid,
        }));
        $(".container").fadeOut(150);
        $('.characters-list').css("filter", "none");
        $('.character-info').css("filter", "none");
        dgChars.fadeOutDown('.character-register', '125%', 400);
        refreshCharacters()
    }
});

// $(document).on('click', '.character', function(e) {
//     var cDataPed = $(this).data('cData');
//     e.preventDefault();
//     if (selectedChar === null) {
//         selectedChar = $(this);
//         if ((selectedChar).data('cid') == "") {
//             $(selectedChar).addClass("char-selected");
//             setupCharInfo('empty')
//             $("#play-text").html("Create");
//             $("#play").css({"display":"block"});
//             $("#delete").css({"display":"none"});
//             $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
//                 cData: cDataPed
//             }));
//         } else {
//             $(selectedChar).addClass("char-selected");
//             setupCharInfo($(this).data('cData'))
//             $("#play-text").html("Play");
//             $("#delete-text").html("Delete");
//             $("#play").css({"display":"block"});
//             $("#delete").css({"display":"block"});
//             $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
//                 cData: cDataPed
//             }));
//         }
//     } else if ($(selectedChar).attr('id') !== $(this).attr('id')) {
//         $(selectedChar).removeClass("char-selected");
//         selectedChar = $(this);
//         if ((selectedChar).data('cid') == "") {
//             $(selectedChar).addClass("char-selected");
//             setupCharInfo('empty')
//             $("#play-text").html("Register");
//             $("#play").css({"display":"block"});
//             $("#delete").css({"display":"none"});
//             $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
//                 cData: cDataPed
//             }));
//         } else {
//             $(selectedChar).addClass("char-selected");
//             setupCharInfo($(this).data('cData'))
//             $("#play-text").html("Play");
//             $("#delete-text").html("Delete");
//             $("#play").css({"display":"block"});
//             $("#delete").css({"display":"block"});
//             $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
//                 cData: cDataPed
//             }));
//         }
//     }
// });

// var entityMap = {
//     '&': '&amp;',
//     '<': '&lt;',
//     '>': '&gt;',
//     '"': '&quot;',
//     "'": '&#39;',
//     '/': '&#x2F;',
//     '': '&#x60;',
//     '=': '&#x3D;'
// };

// function escapeHtml(string) {
//     return String(string).replace(/[&<>"'=/]/g, function (s) {
//         return entityMap[s];
//     });
// }
// function hasWhiteSpace(s) {
//     return /\s/g.test(s);
//   }



// $(document).on('click', '#accept-delete', function(e){
//     $.post('https://qb-multicharacter/removeCharacter', JSON.stringify({
//         citizenid: $(selectedChar).data("citizenid"),
//     }));
//     $('.character-delete').fadeOut(150);
//     $('.characters-block').css("filter", "none");
//     refreshCharacters();
// });

// $(document).on('click', '#cancel-delete', function(e){
//     e.preventDefault();
//     $('.characters-block').css("filter", "none");
//     $('.character-delete').fadeOut(150);
// });

// function refreshCharacters() {
//     $('.characters-list').html('<div class="character" id="char-1" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character" id="char-2" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character" id="char-3" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character" id="char-4" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character" id="char-5" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character-btn" id="play"><p id="play-text">Select a character</p></div><div class="character-btn" id="delete"><p id="delete-text">Select a character</p></div>')
//     setTimeout(function(){
//         $(selectedChar).removeClass("char-selected");
//         selectedChar = null;
//         $.post('https://qb-multicharacter/setupCharacters');
//         $("#delete").css({"display":"none"});
//         $("#play").css({"display":"none"});
//         dgChars.resetAll();
//     }, 100)
// }

// $("#close-reg").click(function (e) {
//     e.preventDefault();
//     $('.characters-list').css("filter", "none")
//     $('.character-info').css("filter", "none")
//     dgChars.fadeOutDown('.character-register', '125%', 400);
// })

// $("#close-del").click(function (e) {
//     e.preventDefault();
//     $('.characters-block').css("filter", "none");
//     $('.character-delete').fadeOut(150);
// })

// $(document).on('click', '#play', function(e) {
//     e.preventDefault();
//     var charData = $(selectedChar).data('cid');

//     if (selectedChar !== null) {
//         if (charData !== "") {
//             $.post('https://qb-multicharacter/selectCharacter', JSON.stringify({
//                 cData: $(selectedChar).data('cData')
//             }));
//             setTimeout(function(){
//                 dgChars.fadeOutDown('.characters-list', "-40%", 400);
//                 dgChars.fadeOutDown('.character-info', "-40%", 400);
//                 dgChars.resetAll();
//             }, 1500);
//         } else {
//             $('.characters-list').css("filter", "blur(2px)")
//             $('.character-info').css("filter", "blur(2px)")
//             dgChars.fadeInDown('.character-register', '25%', 400);
//         }
//     }
// });

$(document).on('click', '#delete', function(e) {
    e.preventDefault();
    var charData = $(selectedChar).data('cid');

    if (selectedChar !== null) {
        if (charData !== "") {
            $('.characters-block').css("filter", "blur(2px)")
            $('.character-delete').fadeIn(250);
        }
    }
});

dgChars.fadeOutUp = function(element, time) {
    $(element).css({"display":"block"}).animate({top: "-80.5%",}, time, function(){
        $(element).css({"display":"none"});
    });
}

dgChars.fadeOutDown = function(element, percent, time) {
    if (percent !== undefined) {
        $(element).css({"display":"block"}).animate({top: percent,}, time, function(){
            $(element).css({"display":"none"});
        });
    } else {
        $(element).css({"display":"block"}).animate({top: "103.5%",}, time, function(){
            $(element).css({"display":"none"});
        });
    }
}

dgChars.fadeInDown = function(element, percent, time) {
    $(element).css({"display":"block"}).animate({top: percent,}, time);
}

dgChars.resetAll = function() {
    $('.characters-list').hide();
    $('.characters-list').css("top", "-40");
    $('.character-info').hide();
    $('.character-info').css("top", "-40");
    $('.welcomescreen').css("top", WelcomePercentage);
    $('.server-log').show();
    $('.server-log').css("top", "25%");
}
