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
                for (k=0; i<chars.length(); k++){
                    if (chars[k].cid == i){
                        $('#slot-name-'+count).text( chars[i].firstname + ' ' + chars[i].lastname);
                        $('#char-'+count).data('cid', chars[i].citizenid);
                        $('#char-'+count).data('cinfo', charInfo);
                        $('#char-'+count).data('count', count);
                        break;
                    } 
                    else {
                        $('#char-'+count).data('count', count);
                        $('#char-'+count).data('cinfo', "empty");
                        $('#slot-name-'+count).text('Maak een karakter');
                    }
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
        selectedChar = {}
        selectedChar.id = count;
        $.post('https://dg-chars/zoomToChar', JSON.stringify({
            count: count,
        }));
        $(".characters-list").fadeOut(150);
        setTimeout(function(){
            dgChars.fadeInDown('.character-create', '10%', 200);
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
   
        let firstname= $('#first_name').val();
        let lastname= $('#last_name').val();
        let nationality= $('#nationality').val();
        let birthdate= $('#bdate').val();
        let gender= $('input[name="group1"]:checked').val();
                
// Ugly Validation 
    if (!firstname){
        $('#first_name').addClass('invalid');
        $.post('https://dg-chars/validationMsg', JSON.stringify({
            text: "Je moet een voornaam invullen!",
        }));
        console.log('empty First_name');
    } else if (!lastname){
        $('#last_name').addClass('invalid');
        $.post('https://dg-chars/validationMsg', JSON.stringify({
            text: "Je moet een achternaamnaam invullen!",
        }));
        console.log('empty Last_name');
    } else if (!nationality){
        $('#nationality').addClass('invalid');
        $.post('https://dg-chars/validationMsg', JSON.stringify({
            text: "Vul je nationaliteit in!",
        }));
        console.log('empty Nationality');
    } else if (!birthdate){
        $('#bdate').addClass('invalid');
        $.post('https://dg-chars/validationMsg', JSON.stringify({
            text: "Vul je geboortedatum in!",
        }));
        console.log('empty Birthdate');
    } else if (!gender){
        $('#gender').addClass('invalid');
        $.post('https://dg-chars/validationMsg', JSON.stringify({
            text: "Je moet een geslacht selecteren!",
        }));
        console.log('empty gender');
        
// End of Ugly Validation
    } else{
        $.post('https://dg-chars/createNewCharacter', JSON.stringify({
            firstname: firstname,
            lastname: lastname,
            nationality: nationality,
            birthdate: birthdate,
            gender: gender,
            cid: selectedChar.id,
        }));
        $(".container").fadeOut(150);
        $('.characters-list').css("filter", "none");
        $('.character-info').css("filter", "none");
        dgChars.fadeOutDown('.character-create', '125%', 400);
        dgChars.resetAll();
    }
});

$(document).on('click', '#accept-delete', function(e){
    $.post('https://dg-chars/removeCharacter', JSON.stringify({
        citizenid: selectedChar.citizenid,
    }));
    $("#MyModal").modal('close');
});

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
    $('.character-create').hide();
    $('.character-create').css("top", "-40");
}
