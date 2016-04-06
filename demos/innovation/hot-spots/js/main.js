var spots = [];
var hotspots = document.getElementById('hotspots');
var seeking = false;



// Setup JW Player
jwplayer("player").setup({
    playlist: '//content.jwplatform.com/jw6/3p683El7.xml',
    width: 720,
    height: 405,
    sharing: {}
});
jwplayer().addButton(
  "http://s3.amazonaws.com/demo.jwplayer.com/hot-spots/toc.png",
  "Table of Contents",
  function(){jwplayer().seek(20);},
  "contents"
);



// Load chapters / captions
jwplayer().onReady(function(){
  var r = new XMLHttpRequest();
  r.onreadystatechange = function() {
    if (r.readyState == 4 && r.status == 200) {
      var t = r.responseText.split("\n\n");
      t.shift();
      for(var i=0; i<t.length; i++) {
        var c = parse(t[i]);
        if(c.href) {
          spots.push(c);
        }
      }
    }
  };
  r.open('GET','http://s3.amazonaws.com/demo.jwplayer.com/hot-spots/hotspots.vtt',true);
  r.send();
});
function parse(d) {
    var a = d.split("\n");
    var t = a[0];
    var i = t.indexOf(' --> ');
    a.shift();
    var j = JSON.parse(a.join(''));
    return {
      begin: seconds(t.substr(0,i)),
      end: seconds(t.substr(i+5)),
      href: j.href,
      left:Number(j.left.substr(0,j.left.length-1))/100,
      top:Number(j.top.substr(0,j.top.length-1))/100,
      show: false
    }
};
function seconds(s) {
  var a = s.split(':');
  var r = Number(a[a.length-1]) + Number(a[a.length-2]) * 60;
  if(a.length > 2) { r+= Number(a[a.length-3]) * 3600; }
  return r;
};



// Highlight active spots
jwplayer().onTime(function(e) {
  if(!seeking) {
    setSpots(e.position);
  }
});
jwplayer().onSeek(function(e) {
  seeking = true;
  setTimeout(function(){seeking=false;},500);
});
function setSpots(p){
  for(var j=0; j<spots.length; j++) {
    if(spots[j].begin <= p && spots[j].end >= p) {
      if(!spots[j].show) {
        var s = document.createElement("span");
        s.id = "spot"+j;
        s.style.left = 720*spots[j].left-20+"px";
        s.style.top = 405*spots[j].top-20+"px";
        popSpot(s);
        hotspots.appendChild(s);
        spots[j].show = true;
      }
    } else if(spots[j].show) {
      dropSpot(document.getElementById("spot"+j));
      spots[j].show = false;
    }
  }
};
function popSpot(s) {
  var t = Math.round(Math.random()*800);
  setTimeout(function(){
    s.style.transform="scale(1,1)";
    s.style.webkitTransform="scale(1,1)";
  }, t);
};
function dropSpot(s) {
  var t = Math.round(Math.random()*400);
  setTimeout(function(){
    s.style.transform = "scale(0,0)";
    s.style.webkitTransform = "scale(0,0)";
  }, t);
  setTimeout(function(){hotspots.removeChild(s);}, t+200);
};



// Hook up rolls and click
hotspots.addEventListener("click",function(e) {
  if(e.target.id.indexOf("spot") == 0) {
    var s = spots[e.target.id.replace("spot","")];
    if(s.href.indexOf("#t=") == 0) {
      jwplayer().seek(s.href.substr(3));
    } else {
      window.open(s.href, "_blank");
      jwplayer().pause(true);
    }
  }
});
hotspots.addEventListener("mouseover",function(e) {
  if(e.target.id.indexOf("spot") == 0) {
    e.target.style.opacity = 1;
  }
});
hotspots.addEventListener("mouseout",function(e) {
  if(e.target.id.indexOf("spot") == 0) {
    e.target.style.opacity = 0.5;
  }
});