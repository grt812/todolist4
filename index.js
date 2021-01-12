$(function(){
  let mouseX = 0;
  let mouseY = 0;
  let titleDisplay = false;
  let globalData;

  if(localStorage.getItem("notes")){
    syncNotes(localStorage.getItem("notes").split(","));
  }

  $(document).on("keyup", function(e){
    if(e.keyCode === 13){
      newNote();
    }
    // console.log("keypress");
    // console.log("up: "+(e.keyCode === 38));
    // if(e.keyCode === 38 && $(":focus").is(".note-input") && $(".note-input").prev().length){
    //   console.log("up");
    //   $(".note-input:focus").parent(".note").prev().find(".note-input").focus();
    // } else {
    //   console.log($(":focus").is(".note-input"));
    // }
    // if(e.keyCode === 40 && $(":focus").is(".note-input") && $(".note-input").next().length){
    //   $(".note-input:focus").parent(".note").next().find(".note-input").focus();
    //   console.log("down");
    // }
  }).trigger("keypress");
  // }).on("mousemove", function(e){
  //   mouseX = e.pageX;
  //   mouseY = e.pageY;
  //   // $(".dragging").css("top", "")
  // });
  //
  // $(".note").each(function(){
  //   let dragging = false;
  //   let $this = $(this);
  //   $(this).children(".drag").on("mousedown", function(){
  //     dragging = true;
  //     $this.addClass("dragging");
  //   }).on("mouseup", function(){
  //     dragging = false;
  //     $this.removeClass("dragging");
  //   });
  // });

  // function newNote(text = ""){
  //   $("")
  // }

  let indicatorShowing;
  if(document.hasFocus()){
    indicatorShowing = false;
    $("#focus-indicator").css("opacity","0");
  } else {
    indicatorShowing = true;
    $("#focus-indicator").css("opacity","1");
    // $(window).trigger("blur");
  }

  $(window).on("focus", function(){
    if(indicatorShowing){
      $("#focus-indicator").removeClass(["fade-in","fade-out"]).addClass("fade-out").off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
        $(this).removeClass(["fade-in","fade-out"]).css("opacity", 0).off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
        indicatorShowing = false;
      });
    }
  });

  $(window).blur(function(){
    if(!indicatorShowing){
      $("#focus-indicator").show().removeClass(["fade-in","fade-out"]).addClass("fade-in").off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
        $(this).removeClass(["fade-in","fade-out"]).css("opacity", 1).off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
      });
      indicatorShowing = true;
    }
  });


  checkEmpty(false);

  function checkEmpty(animation=true){
    if(!$("#note-container").children(".note:not(.delete-animation)").length && !titleDisplay){
      $("#title-overlay").show().removeClass([".overlay-in","overlay-out"]).off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
      if(animation){
        $("#title-overlay").addClass("overlay-in");
      }
      titleDisplay = true;
    } else if($("#note-container").children(".note:not(.delete-animation)").length && titleDisplay){
      $("#title-overlay").removeClass([".overlay-in","overlay-out"])
      if(animation){
        $("#title-overlay").addClass("overlay-out").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
          $(this).hide();
        });
      } else {
        $("#title-overlay").hide();
      }
      titleDisplay = false;
    }
  }

  $("#note-container").sortable({
    handle: ".drag"
  });

  function onDelete(thisObject){
    let $this =  thisObject.target ? $(this) : thisObject;
    if($this.parent(".note:not(.delete-animation)").prev().length){
      // console.log("previous exists: "+$this.parent(".note").prev().is($this));
      if(!thisObject.target){
        setTimeout(function(){
          $this.parent(".note").prev().find(".note-input").focus();
        }, 0);
      }
    } else {
      if(!thisObject.target){
        setTimeout(function(){
          $this.parent(".note").next().find(".note-input").focus();
        }, 0);
      }
    }
    $this.parent(".note").addClass("delete-animation").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
      $(this).off();
      $(this).remove();
      updateNotes();
    });
    checkEmpty();
  }

  function onKeyDelete(e, thisObject){
    let $this = thisObject;
    if(e.keyCode == 8 && !$this.val()){
      onDelete($this);
    }
  }

  $("#new-note").on("click",newNote);

  function newNote(text="",animation=true){
    if(text.target){
      text="";
    }
    if(!$(":focus").is(".note-input")){
      $("#note-container").append(`
        <div class="note new ${animation?"add-animation":""}">
          <span class="material-icons drag">drag_indicator</span>
          <input class="note-input" type="text" placeholder="Type something..." value="${text}">
          <span class="material-icons delete">delete</span>
        </div>
      `)
    } else {
      $(".note-input:focus").parent(".note").after(`
        <div class="note new ${animation?"add-animation":""}">
          <span class="material-icons drag">drag_indicator</span>
          <input class="note-input" type="text" placeholder="Type something..." value="${text}">
          <span class="material-icons delete">delete</span>
        </div>
      `)
    }
    $(".new").find(".delete").on("click",onDelete);
    $(".new").find(".note-input").on("change keyup", function(e){
      updateNotes();
    }).on("keydown",function(e){
      onKeyDelete(e, $(this));
    }).on("keydown", function(e){
      if(e.keyCode === 38){
        let tempInput = $(this).parent(".note").prevAll(":not(.delete-animation)").first().find(".note-input");
        let tempValue = tempInput.val();
        tempInput.focus().val("");
        setTimeout(function(){
          tempInput.val(tempValue);
        }, 0);
      }else if(e.keyCode === 40){
        let tempInput = $(this).parent(".note").nextAll(":not(.delete-animation)").first().find(".note-input");
        tempInput.focus().val(tempInput.val());
        // let tempValue = tempInput.val();
        // tempInput.focus().val("");
        // setTimeout(function(){
        //   tempInput.val(tempValue);
        // }, 0);
      }
    }).focus();
    $(".new").removeClass("new").on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
      $(this).removeClass("add-animation");
    }).click(function(){
      $(this).find(".note-input").focus().val($(this).find(".note-input").val());
    });
    checkEmpty(animation);
  }

  function syncNotes(noteList){
    $("#note-container").empty();
    noteList.forEach(function(i){
      newNote(window.atob(i), false);
    });
  }

  window.addEventListener("storage", ()=>{
    if(globalData !== localStorage.getItem("notes")){
      syncNotes(localStorage.getItem("notes").split(","));
    }
  });

  // syncNotes(["bruh", "bruh2"]);

  function updateNotes(){
    let data = [];
    $("#note-container").find(".note").each(function(){
      data.push(window.btoa($(this).find(".note-input").val()));
    });
    globalData = data.toString();
    localStorage.setItem("notes", globalData)
  }

});
