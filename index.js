$(function(){
  const LIGHT_MODE = "lightMode";
  const DARK_MODE = "darkMode";
  const AQUA_MODE = "aquaMode";
  const SUNSET_MODE = "sunsetMode";
  const DEFAULT_MODE = "defaultMode";
  const CUSTOM_MODE = "customMode";

  let mouseX = 0;
  let mouseY = 0;
  let titleDisplay = false;
  let globalData;
  let darkMode = false;
  let theme = "";
  let customModeEnabled = false;

  //Load saved data
  if(localStorage.getItem("notes")){
    try{
        console.log(JSON.parse(localStorage.getItem("notes")));
        syncNotes(localStorage.getItem("notes"));
    } catch(e){
        console.error(e.stack);
        let tempNoteList  = localStorage.getItem("notes").split(",")
        let tempObjectList = [];
        tempNoteList.forEach(function(e, i){
            tempObjectList.push({content:window.atob(tempNoteList[i]), completed: false});
        });
        syncNotes(JSON.stringify(tempObjectList));
    }
  }

  //Sync Prefernces
  syncPreferences();


  //Sync completed items
  if(localStorage.getItem("completed")){
      syncCompleted();
  }

  //Create new note on enter key press
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

  // let indicatorShowing;
  // if(document.hasFocus()){
  //   indicatorShowing = false;
  //   $("#focus-indicator").css("opacity","0");
  // } else {
  //   indicatorShowing = true;
  //   $("#focus-indicator").css("opacity","1");
  //   // $(window).trigger("blur");
  // }
  //
  // $(window).on("focus", function(){
  //   if(indicatorShowing){
  //     $("#focus-indicator").removeClass(["fade-in","fade-out"]).addClass("fade-out").off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
  //       $(this).removeClass(["fade-in","fade-out"]).css("opacity", 0).off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
  //       indicatorShowing = false;
  //     });
  //   }
  // });
  //
  // $(window).blur(function(){
  //   if(!indicatorShowing){
  //     $("#focus-indicator").show().removeClass(["fade-in","fade-out"]).addClass("fade-in").off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
  //       $(this).removeClass(["fade-in","fade-out"]).css("opacity", 1).off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
  //     });
  //     indicatorShowing = true;
  //   }
  // });


  checkEmpty(false);

  function checkEmpty(animation=true){
    if(!$("#note-container").children(".note:not(.delete-animation)").length && !titleDisplay){
      $("#title-overlay").show().removeClass([".overlay-in","overlay-out"]).off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
      if(animation){
        $("#title-overlay").addClass("overlay-in");
        $("#new-item-button").stop().hide(500);
    } else {
        $("#new-item-button").stop().hide();
    }
      titleDisplay = true;
    } else if($("#note-container").children(".note:not(.delete-animation)").length && titleDisplay){
      $("#title-overlay").removeClass([".overlay-in","overlay-out"])
      if(animation){
        $("#title-overlay").addClass("overlay-out").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
          $(this).hide();
        });
        $("#new-item-button").stop().show(500);
      } else {
        $("#new-item-button").stop().show();
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

  $("#new-note").on("click", newNote);
  $("#new-item-button").on("click", function(){
      newNote();
  });

  function newNote(text="", animation=true, completed=false, starred = false){
    if(text.target){
      text="";
    }
    if(animation && $("#note-container").outerHeight() > $(window).height() - 130){
        $("#new-item-button").stop().hide(500);
    }
    if(!$(":focus").is(".note-input")){
      $("#note-container").append(`
        <div class="note new ${starred?"starred":""} ${animation?"add-animation"+(completed ? " completed":""):(completed ? "completed":"")}">
          <span class="material-icons drag">drag_indicator</span>
          <span class="material-icons toggle-completion">${(completed ? "check_box":"check_box_outline_blank")}</span>
          <input class="note-input" type="text" placeholder="Type something..." value="${text}" size="1">
          <span class="material-icons star">bookmark</span>
          <span class="material-icons delete">delete</span>
          <span class="material-icons">more_vert</span>
        </div>
      `)
    } else {
      $(".note-input:focus").parent(".note").after(`
        <div class="note new ${starred?"starred":""} ${animation?"add-animation"+(completed ? " completed":""):(completed ? "completed":"")}">
          <span class="material-icons drag">drag_indicator</span>
          <span class="material-icons toggle-completion">${(completed ? "check_box":"check_box_outline_blank")}</span>
          <input class="note-input" type="text" placeholder="Type something..." value="${text}" size="1">
          <span class="material-icons star">bookmark</span>
          <span class="material-icons delete">delete</span>
          <span class="material-icons">more_vert</span>
        </div>
      `)
    }
    $(".new").find(".delete").on("click",onDelete);
    $(".new").find(".toggle-completion").on("click", function(){
        $(this).parent(".note").toggleClass("completed");
        if($(this).parent(".note").is(".completed")){
            $(this).text("check_box");
        } else {
            $(this).text("check_box_outline_blank");
        }
        updateNotes();
    });
    $(".new").find(".star").on("click",function(e){
        $(this).parent(".note").toggleClass("starred");
        // if($(this).parent(".note").is(".starred")){
        //     $(this).text("bookmark");
        // } else {
        //     $(this).text("bookmark_border");
        // }
        updateNotes();
    });
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
      if(!titleDisplay){
          $("#new-item-button").stop().show(500);
      }
      if(animation && $("#mobile").is(":hidden")){
          window.scrollTo(0,document.body.scrollHeight);
      }
    }).click(function(){
      $(this).find(".note-input").focus().val($(this).find(".note-input").val());
    });
    checkEmpty(animation);
  }

  //iPhone Resize Content when Keyboard is open
  window.visualViewport.addEventListener("resize", function(){
      if(window.visualViewport.height !== $(window).height()){
          // setTimeout(function(){alert("Visual Viewport Height: "+window.visualViewport.height)}, 1000);
          $("html, body, #inner, #outer").css("height", window.visualViewport.height+"px !important");
          $("html, body, #inner, #outer").css("max-height", window.visualViewport.height+"px !important");
      }
  });


  function syncNotes(noteList){
    $("#note-container").empty();
    let tempList = JSON.parse(noteList);
    tempList.forEach(function(e, i){
        console.log("raw:");
        console.log(e.completed);
        console.log("evaluated: "+e.completed == "true");
        if(!e.hasOwnProperty("starred")){
            e.starred = false;
        }
      newNote(e.content, false, e.completed, e.starred);
    });
  }

  function syncPreferences(){
      if(localStorage.getItem("customTheme") && localStorage.getItem("theme") === CUSTOM_MODE){
          // const observer = new MutationObserver(function(mutationsList){
          //     mutationsList.forEach(function(e){
          //         if(e.type === "childList" && e.addedNodes){
          //             console.log(e);
          //
          //         }
          //     });
          // });
          $("head").append(`<style id="customMode" class="theme">${localStorage.getItem("customTheme")}</style>`);
          setAllThemeProperties();
          // observer.observe($("head")[0], {childList: true, subtree: true});
      }else if(localStorage.getItem("theme") !== CUSTOM_MODE){
          console.log("Custom Theme Overriding...");
          addTheme(localStorage.getItem("theme"));
      } else if(localStorage.getItem("darkMode")){
          if(localStorage.getItem("darkMode").trim() == "true"){
              addTheme(DARK_MODE);
          }
          localStorage.removeItem("darkMode");
      } else {
          addTheme(DEFAULT_MODE)
      }
      // setTimeout(function(){$("#loading-background").hide();}, 50);
  }

  // function syncCompleted(){}

  window.addEventListener("storage", ()=>{
    if(globalData !== localStorage.getItem("notes")){
      syncNotes(localStorage.getItem("notes").split(","));
    }
    if(localStorage.getItem("darkMode")){
      syncPreferences();
    }
  });

  // syncNotes(["bruh", "bruh2"]);

  function updateNotes(){
    let data = [];
    $("#note-container").find(".note").each(function(){
      data.push({content:$(this).find(".note-input").val(), completed:$(this).hasClass("completed"), starred:$(this).hasClass("starred")});
    });
    globalData = JSON.stringify(data);
    localStorage.setItem("notes", globalData)
  }

  function updatePreferences(){

  }

    //Thanks to Tim Down from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

  function addTheme(themeName){
      $(".theme").remove();
      localStorage.setItem("theme", themeName);
      if(themeName !== CUSTOM_MODE && themeName !== DEFAULT_MODE && themeName !== LIGHT_MODE){
          $("head").append(`<link id="${themeName}" rel="stylesheet" href="${themeName}.css" class="theme">`);
          setTimeout(function(){
             setAllThemeProperties();
         }, 50);
     } else if(themeName === CUSTOM_MODE){
          customModeEnabled = true;
          let shadowColor = hexToRgb($("#shadow-input").val());
          $("head").append(`
              <style id="customMode" class="theme">
                :root{
                    --text-color: ${$("#text-color-input").val()};
                    --bg-color: ${$("#bg-color-input").val()};
                    --fg-color: ${$("#fg-color-input").val()};
                    --accent-color: ${$("#accent-color-input").val()};
                    --accent-input-color: ${$("#input-accent-color-input").val()};
                    --accent-text-color: ${$("#accent-text-color-input").val()};
                    --accent-input-text-color: ${$("#input-accent-text-color-input").val()};
                    --scrollbar: ${$("#scrollbar-input").val()};
                    --scrolltrack: ${$("#scrolltrack-input").val()};
                    --default-shadow-color: ${$("#toggle-shadow")[0].checked ? `rgba(${shadowColor.r}, ${shadowColor.g}, ${shadowColor.b}, 0.8)` : "transparent"} ;
                    --default-light-shadow-color: ${$("#toggle-shadow")[0].checked ? `rgba(${shadowColor.r}, ${shadowColor.g}, ${shadowColor.b}, 0.5)` : "transparent"};
                }
              </style>
          `);
          localStorage.setItem("customTheme", $("#customMode").text());
      } else if(themeName === DEFAULT_MODE){
          //Thanks to Mark Szabo from https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
          if(window.matchMedia){
              if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  addTheme(DARK_MODE);
              } else if(window.matchMedia('(prefers-color-scheme: light)').matches){
                  addTheme(LIGHT_MODE);
              }
          } else {
              alert("Lol what type of browser are you using? Get Chrome here: https://www.google.com/chrome/ or Firefox here: https://www.mozilla.org/en-US/firefox/new/ ")
          }
      } else if(themeName === LIGHT_MODE){
           setAllThemeProperties();
      }
  }

  $("#custom-theme-toggle").click(function(){
      addTheme(CUSTOM_MODE);
  });

    // setAllThemeProperties();
    //Set Default Color Values in Settings
    function setAllThemeProperties(){
        console.log("running");
        $("#text-color-input").val(getComputedStyle(document.documentElement).getPropertyValue('--text-color').toLowerCase().trim());
        $("#bg-color-input").val(getComputedStyle(document.documentElement).getPropertyValue('--bg-color').toLowerCase().trim());
        $("#fg-color-input").val(getComputedStyle(document.documentElement).getPropertyValue('--fg-color').toLowerCase().trim());
        $("#accent-color-input").val(getComputedStyle(document.documentElement).getPropertyValue('--accent-color').toLowerCase().trim());
        $("#input-accent-color-input").val(getComputedStyle(document.documentElement).getPropertyValue('--accent-input-color').toLowerCase().trim());
        $("#accent-text-color-input").val(getComputedStyle(document.documentElement).getPropertyValue('--accent-text-color').toLowerCase().trim());
        $("#input-accent-text-color-input").val(getComputedStyle(document.documentElement).getPropertyValue('--accent-input-text-color').toLowerCase().trim());
        $("#scrollbar-input").val(getComputedStyle(document.documentElement).getPropertyValue('--scrollbar').toLowerCase().trim());
        $("#scrolltrack-input").val(getComputedStyle(document.documentElement).getPropertyValue('--scrolltrack').toLowerCase().trim());
        let shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--default-shadow-color');
        console.log("Shadow Color: " +shadowColor.trim());
        if(shadowColor.trim() !== "transparent"){
            console.log("not transparent");
            let shadowColorRed = shadowColor.slice(shadowColor.indexOf("(")+1, shadowColor.indexOf(",")).trim();
            shadowColor = shadowColor.slice(shadowColor.indexOf(",") + 1, shadowColor.length);
            let shadowColorGreen = shadowColor.slice(0, shadowColor.indexOf(",")).trim();
            shadowColor = shadowColor.slice(shadowColor.indexOf(",") + 1, shadowColor.length);
            let shadowColorBlue = shadowColor.slice(0, shadowColor.indexOf(",")).trim();
            shadowColor = rgbToHex(Number(shadowColorRed), Number(shadowColorGreen), Number(shadowColorBlue));
            $("#shadow-input").val(shadowColor);
            $("#toggle-shadow")[0].checked = true;
        } else {
            $("#toggle-shadow")[0].checked = false;
        }

    }

  // if(window.matchMedia){
  //     if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
  //         addTheme(DARK_MODE);
  //     } else if(window.matchMedia('(prefers-color-scheme: light)').matches){
  //         addTheme(LIGHT_MODE);
  //     }
  // } else {
  //     alert("Lol what type of browser are you using? Get Chrome here: https://www.google.com/chrome/ or Firefox here: https://www.mozilla.org/en-US/firefox/new/ ")
  // }
  // $("#custom-theme-input").val()



  //Toggle Dark/Light Theme
  $("#dark-theme-button, #dark-template").on("click", function(){
      // $("#dark-css").remove();
      // $("head").append(`<link id="dark-css" rel="stylesheet" href="dark.css">`);
      // darkMode = true;
      // localStorage.setItem("darkMode", darkMode);
      addTheme(DARK_MODE);
  });

  $("#light-theme-button, #light-template").on("click", function(){
      addTheme(LIGHT_MODE);
  });

$("#default-theme-button").on("click", function(){
    addTheme(DEFAULT_MODE);
});

$("#custom-theme-button").on("click", function(){
    addTheme(CUSTOM_MODE);
});

$("#sunset-theme-button, #sunset-template").on("click", function(){
    addTheme(SUNSET_MODE);
});

$("#aqua-theme-button, #aqua-template").on("click", function(){
    addTheme(AQUA_MODE);
});

$("#background-img-input").on("change", function(){
    let reader = new FileReader();
    reader.onload = function(e) {
        console.log("image: "+e.target.result)
      $("#background").css("background-image", `url(${e.target.result})`)
    }
    reader.readAsDataURL($(this)[0].files[0]);
    // let tempURL = URL.createObjectURL($(this)[0].files[$(this)[0].files.length - 1]);
    // console.log("change");
    // console.log("img url: "+tempURL)

});

$("#opacity-input").on("change", function(){
    // let hoverVal = ;
        let opacity = Number($(this).val());
        $("#bg-img-style").html(`
            .ui-component{
                opacity: ${opacity};
            }
            .note.completed{
                opacity: ${opacity * 0.5} !important;
            }
            .note{
                opacity: ${opacity} !important;
            }
            .note:hover{
                opacity: ${(opacity + (1 - opacity) * 0.5)} !important;
            }
            .note:active{
                opacity: 1 !important;
            }
            .modal .ui-component{
                opacity: 1 !important;
            }
        `);
});

$("#blur-input").on("change", function(){
    console.log($(this).val());
    $("#background").css("filter", "blur("+$(this).val()+"px)")
});


$("#remove-bg-img").click(function(){
    // $()
});


  function getDarkMode(isDarkMode){
      $("#dark-css").remove();
      if(isDarkMode){
          $("head").append(`<link id="dark-css" rel="stylesheet" href="dark.css">`);
      }
      // darkMode = !isDarkMode;
      // localStorage.setItem("darkMode", isDarkMode);
  }

  $(".modal").hide();

  //Settings
  $("#settings-button").click(function(){
      showModal("#settings");
  });

  function showModal(selector){
      // $(selector).one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
      //     selector.removeClass("showAnimation").off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
      // });
      $(selector).addClass("showAnimation").removeClass("hideAnimation").show();
      $(selector).find(".inner").addClass("showAnimation").removeClass("hideAnimation").show();
  }

  //animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd
  $(".close-modal").click(function(){
      $(this).parents(".modal").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
          $(this).removeClass("showAnimation").removeClass("hideAnimation").hide().off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
      });
      // $(this).parents(".inner").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
      //     $(this).removeClass("showAnimation").removeClass("hideAnimation").hide().off("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
      // });
      $(this).parents(".modal").removeClass("showAnimation").show().addClass("hideAnimation");
      // $(this).parents(".inner").addClass("hideAnimation").removeClass("showAnimation");

  });

  $("#delete-all-items").click(function(){
      if(confirm("Are you sure you want to delete all items?")){
          $("#note-container").empty();
          updateNotes();
          checkEmpty(true);
      }
  });

});
