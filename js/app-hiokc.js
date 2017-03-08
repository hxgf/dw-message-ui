Dropzone.autoDiscover = false;


function post_json(url, data, callback){
   return $.ajax({
     type: "POST",
     url: url,
     dataType: 'json',
     data: data
   }).done(function( data ) {

     if (callback){
       callback(data);
     }else{
       return data;
     }
   });
}



function format_timestamp(date){

 var months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
 var o = months[date.getMonth()] +'/'+ date.getDate() +'/'+ date.getFullYear();
 var hr = date.getHours();
 var ampm = hr < 12 ? "am" : "pm";

 if (hr > 12) {
     hr -= 12;
 } else if (hr === 0) {
    hr = 12;
 }

 o+= ' - '+ hr +':'+ date.getMinutes() + ampm;

 return o;
}





// fixit move admin to separate file

function aggregate_event(action, _id){
  // fixit global working indicator
  post_json("/ajax/aggregate-event", {
    _id: _id,
    action: action,
    custom_url: '' // fixit conditional custom url
  }, function(r){
    // fixit remove global working
    $('li[data-id="' + _id + '"]').remove();
    // fixit if import, open event edit screen in new window
    //  /events/edit/r._id
  });
}


function user_group(_id){
  // fixit global working indicator
  post_json("/ajax/update-user-group", {
    _id: _id,
    group_id: $('li[data-id="' + _id + '"] select').val()
  }, function(r){
    // fixit remove global working
  });
}







$(function(){





  $("#message-link").on('click', function(){
    $(".send-message").addClass("active");
  });

  // fixit consistent loading indicators
    // all forms opacity at half. maybe a loading icon?
      // $("body").addClass("working");
      // $(".message-sent").text('Message sent 6/19/2014 - 12:12pm');
      // $("body").removeClass("working");








  $("#message-send").on('click', function(){
    if ($("textarea").val()){
      var body = $("textarea").val();
      post_json("/ajax/message-send", {
        recipient_id: $(this).data('recipient'),
        body: body,
        thread_id: $(this).data('thread')
      }, function(r){
        $(".message-sent").text('Message sent - ' + format_timestamp(new Date()));
        $(".send-message").removeClass("active");
        $(".send-message").addClass("sent");
      });
    }
  });









  $("#message-reply").on('click', function(){
    if ($("textarea").val()){
      var body = $("textarea").val();
      post_json("/ajax/message-send", {
        recipient_id: $(this).data('recipient'),
        body: body,
        thread_id: $(this).data('thread')
      }, function(r){
        $("ul.message-stream").append(
        '<li class="recipient">'+
          '<span class="avatar"><img src="'+r.avatar_url+'" /></span>'+
          '<span class="data">'+
            '<span class="message">'+ body +'</span>'+
            '<span class="date">'+ format_timestamp(new Date()) +'</span>'+
          '</span>'+
        '</li>');
        $("textarea").val('');
      });
    }
  });













  $("button[rel='login']").on('click', function(e){
    e.preventDefault();
    $(".login").addClass("loading");
    $(".error").removeClass("error");
    post_json("/ajax/login", {
      email: $("input[name='email']").val(),
      password: $("input[name='password']").val()
    }, function(r){
      if (r.success){
        if (r.redirect && r.direct != 'undefined'){
          window.location.href = r.redirect;
        }else{
          window.location.href = '/';
        }
      }else{

        if (r.error.email){
          $(".login").removeClass("loading");
          $(".validate-email").addClass("error");
          $(".login input[name='email']").val('');
          // $(".login input[name='email']").focus();
          $(".validate-email span").html(r.error.message);
        }
        if (r.error.password){
          $(".login").removeClass("loading");
          $(".validate-password").addClass("error");
          $(".login input[name='password']").val('');
          // $(".login input[name='password']").focus();
          $(".validate-password span").html(r.error.message);
        }
      }
    });
  });









  $(".validate input").on('blur', function(){
    var type = $(this).data('type');
    var ths = $(this);

    post_json("/ajax/unique", {
      value: $(this).val(),
      id: $(this).data('id'),
      type: type
    }, function(r){
      if (r.error){
        $(".validate-"+type).addClass('error');
        ths.siblings('span').html(r.error_message);
      }else{
        $(".validate-"+type).removeClass('error');
        ths.siblings('span').html('');
      }
    });
  });




 $('body').on({
   focus : function(){
     $(this).parents('.error').removeClass('error');
     $(this).parents('.error span').html('');
   }
 },".error input");














 $(".thumb-upload-button").on('click', function(e){
   e.preventDefault();

   $(".thumb-upload").show();
   $(".upload-container-thumb .control").hide();


   var dz = new Dropzone("#dropzone", {
     url: "/ajax/upload",
     dictDefaultMessage: "Drop your photo here :)",
     uploadMultiple: false,
     dictCancelUpload: "",
     dictRemoveFile: "",
     dictFallbackText: "",
     clickable: ".dropzone",
     previewTemplate:
     '<div class="dz-preview dz-file-preview">'+
     '<div class="dz-details">'+
     '<div class="dz-filename"><span data-dz-name></span></div>'+
     '</div>'+
     '<div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>'+
     '<div class="dz-error-message"><span data-dz-errormessage></span></div>'+
     '</div>'
   });
// $("body").removeClass('working');

    dz.on('addedfile', function(){
      $("body").addClass('working');
    });

   dz.on("complete", function (file) {
     if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
       $(".thumb-upload").hide();
       $(".thumb-upload-success").show();
       // $(".upload-container-thumb .control").show();

       $("body").removeClass('working');


       if ($(".placeholder").length > 0){
         $(".placeholder").addClass('preview');
         $(".placeholder").html('<img src="/uploads/temp-'+$(".dz-filename span").text()+'" >');
       }else{
         $(".upload-container-thumb img").attr('src', '/uploads/temp-' + $(".dz-filename span").text());
       }

       $('<input>').attr({
         type: 'hidden',
         name: 'filename',
         value: $(".dz-filename span").text()
       }).appendTo('form');
     }
   });


 });












 $("#crop-save").on('click', function(e){
   $("#crop-image").css('opacity', '0.3');
   post_json("/ajax/thumbnail-crop", {
     x: $("input[name='x']").val(),
     y: $("input[name='y']").val(),
     w: $("input[name='w']").val(),
     h: $("input[name='h']").val(),
     stretch: $("input[name='h']").val(),
     source: $("input[name='source']").val()
   }, function(r){
     $.fancybox.close();
     $("#crop-image").css('opacity', '1');
     if (r.error){
       smoke.alert(r.error);
     }else{
       smoke.alert('Thumbnail changes saved.');
     }
   });
 });











 $("a.crop-button").fancybox({
   width	: 260,
   height	: 330,
   fitToView	: false,
   autoSize	: false,
   closeClick	: false,
   openEffect	: 'none',
   closeEffect	: 'none'
 });


 $('img.cropimage').jQcrop({
   width: 250, height: 250
 }).on('crop.jQcrop', function(e, data) {
   $("input[name='x']").val(data.cropX);
   $("input[name='y']").val(data.cropY);
   $("input[name='w']").val(data.cropW);
   $("input[name='h']").val(data.cropH);
   $("input[name='stretch']").val(data.stretch);
 });







$("form").on('submit', function(){
  $("body").addClass('working');
});






});
