/*
 * SVG Icons and Animation algorithm originally created for FoxyProxy for Firefox by Jesper Hansen.
 */
(function() {
    
    var icon = document.createElement('img');
    icon.setAttribute('src', 'images/16x16.svg');
    
    var iconDisabled = document.createElement('img');
    iconDisabled.setAttribute('src', 'images/icon-disabled.svg');
    
    var foxyproxy, foxyProxy;

     var canvas = document.createElement('canvas');
     canvas.setAttribute('width', 19);
     canvas.setAttribute('height', 19);

     var canvasContext = canvas.getContext('2d');
             
    chrome.runtime.getBackgroundPage(function( bgPage) {

         foxyproxy = foxyProxy = bgPage.foxyProxy; // init Hendrix typing.

         ///////////////// icons \\\\\\\\\\\\\\\\\\\\\
         foxyProxy.svgIcons = {

           angle : 4,
           runners : 0,
           icons : null,
           iconColorNodes : null,
           iconDisabledMask : null,

           init : function() {
               console.log("svg-icons init");
               this.icons = [icon];

//             this.iconColorNodes = [icon];

                this.iconDisabledMask = [iconDisabled];

             
                 this.__defineSetter__("color", function (c) {
                     console.log("set color: " + c);
                 
                     canvasContext.save();
                     canvasContext.clearRect(0, 0, canvas.width, canvas.height);

                     canvasContext.translate(
                         Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));

                      for (var i in this.icons) {
                          console.log("set color :: color =>" + c);
                          this.paintIcon(this.icons[i], c);
                      }

                   canvasContext.restore();

                   chrome.browserAction.setIcon({
                       imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
                   });
               });

             // this.__defineSetter__("mode", function (m) {
             //     var i;
             //     
             //   if (m == "static") {
             //     var color = foxyproxy.fp._selectedProxy.color;
             //     foxyproxy.statusText.setAttribute("style", "color: " + color);
             //     for ( i in this.iconColorNodes)
             //       this.iconColorNodes[i].setAttribute("style", "fill: "+color+";");        
             //   }
             //   else
             //     this.resetIconColors(m);
             // 
             //   for ( i in this.iconDisabledMask) {
             //     this.iconDisabledMask[i].removeAttribute("style");
             //     this.iconDisabledMask[i].setAttribute("mode", m);
             //   }
             // });
           },

           animate : function( color) {
             if (this.runners > 8) return; // reached the max spin rate
             this.runners++;
             this.animate_runner( color);
           },

           animate_runner : function( color) {
               // Chrome-style
                canvasContext.save();
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
               
                canvasContext.translate(
                    Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
                   
               
               canvasContext.rotate((this.angle/2)*Math.PI/180);
               
               this.paintIcon(icon, color);

               canvasContext.restore();

               chrome.browserAction.setIcon({
                   imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
               });
               
            // generic-style
             this.angle += 6;
             if (this.angle > 720) {
               this.angle = 4;
            
               this.runners--;

               return;
             }
             setTimeout(function() { foxyproxy.svgIcons.animate_runner( color); }, 10);
           },

           throb : function(mp) {

               this.animate( mp.data.color);
             
             setTimeout(function() { foxyproxy.svgIcons.unthrob(mp); }, 800);
           },

           resetIconColors : function(modeAsText) {
             // Reset the icon color back to what it should be
             this.color = undefined;
           },
           
           unthrob : function(mp) {
               foxyproxy.svgIcons.resetIconColors();
           },
           
           
            ///////////////// 
                    
            /*
            Color distance algorithm based on:
            http://www.emanueleferonato.com/2009/08/28/color-differences-algorithm/
            http://www.emanueleferonato.com/2009/09/08/color-difference-algorithm-part-2/
            by Emanuele Feronato
            */
           colorDistance: function (a, b) {
               var lab1 = this.XYZToLab(this.RGBToXYZ(a));
               var lab2 = this.XYZToLab(this.RGBToXYZ(b));

               var c1 = Math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2]);
               var c2 = Math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2]);
               var dc = c1 - c2;
               var dl = lab1[0] - lab2[0];
               var da = lab1[1] - lab2[1];
               var db = lab1[2] - lab2[2];
               var dh = Math.sqrt((da * da) + (db * db) - (dc * dc));
               var first = dl;
               var second =  dc / (1 + 0.045 * c1);
               var third = dh / (1 + 0.015 * c1);
               return Math.sqrt(first * first + second * second + third * third);
           },

           RGBToXYZ: function (rgb) {
               var rgbDec = [rgb.r / 255.0, rgb.g / 255.0, rgb.b / 255.0];

               for(var i = 0; i < 3; ++i) {
                   var color = rgbDec[i];
                   if(color > 0.04045) {
                       color = (color + 0.055) / 1.055;
                       color = Math.pow(color, 2.4);
                   } else {
                       color = color / 12.92;
                   }
                   rgbDec[i] = color * 100;
               }
               var x = rgbDec[0] * 0.4124 + rgbDec[1] * 0.3576 + rgbDec[2] * 0.1805;
               var y = rgbDec[0] * 0.2126 + rgbDec[1] * 0.7152 + rgbDec[2] * 0.0722;
               var z = rgbDec[0] * 0.0193 + rgbDec[1] * 0.1192 + rgbDec[2] * 0.9505;
               return [x, y, z];
           },

           XYZToLab: function (xyz) {
               var xyzAdj = [xyz[0] / 95.047, xyz[1] / 100, xyz[2] / 108.883];

               for(var i = 0; i < 3; ++i) {
                   var color = xyzAdj[i];
                   if(color > 0.008856) {
                       color = Math.pow(color, 1 / 3.0);
                   } else {
                       color = (7.787 * color) + (16 / 116.0);
                   }
                   xyzAdj[i] = color;
               }

               var l = (116 * xyzAdj[1]) - 16;
               var a = 500 * (xyzAdj[0] - xyzAdj[1]);
               var b = 200 * (xyzAdj[1] - xyzAdj[2]);
               return [l, a, b];
           },

           HexToRGB: function (hex) {
               hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
               return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF), a: 1};
           },
           
           RGBAStrToRGB: function(rgbaStr) {
               var brokenValue = rgbaStr.replace(/rgba\s*\(([\d\s,.]*)\)/i, '$1').split(',');
               var rgbaValue = {
                   r: parseInt(brokenValue[0].trim(), 10),
                   g: parseInt(brokenValue[1].trim(), 10),
                   b: parseInt(brokenValue[2].trim(), 10),
                   a: parseFloat(brokenValue[3].trim())
               };
               return rgbaValue;
           },
           
           StrToRGB: function(colorStr) {
               if(colorStr.indexOf('#') >= 0) {
                   return this.HexToRGB(colorStr);
               }
               return this.RGBAStrToRGB(colorStr);
           },
           
         };
         
         ///////////////// 
         
         foxyProxy.svgIcons.paintIcon = function paintIcon(icon, color) {
             var imgData, pixelData, colorChangeInterval;
                          
             if (color) {
             
                 if(color.r || typeof color == 'string') {
                     color = [color];
                 }
                 for(var i = 0; i < color.length; ++i) {
                     if(typeof color[i] == 'string') {
                         color[i] = this.StrToRGB(color[i]);
                     }
                 }

                 //var referenceColor = {r: 95, g: 167, b: 220};
                 var referenceColor = {r: 231, g: 133, b: 0};
             
                 canvasContext.drawImage(icon, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
                 //canvasContext.drawImage(icon,0,0);
             
                 imgData = canvasContext.getImageData(0, 0, 19, 19);
                 pixelData = imgData.data;
                 colorChangeInterval = (19 * 4) / color.length;
                 for (var x = 0; x < 19; ++x) {
                     for (var y = 0; y < (19 * 4); y += 4) {
                         var currentColor = color[parseInt(y / colorChangeInterval, 10)];
                         var pos = (x * 19 * 4) + y;
                         var dist = this.colorDistance(referenceColor, {r: pixelData[pos + 0], g: pixelData[pos + 1], b: pixelData[pos + 2]});
                         if(dist < 27) {
                             var luminance = 0.3 * pixelData[pos + 0] + 0.59 * pixelData[pos + 1] + 0.11 * pixelData[pos + 2];
                             pixelData[pos + 0] = currentColor.r * (luminance / 127);
                             pixelData[pos + 1] = currentColor.g * (luminance / 127);
                             pixelData[pos + 2] = currentColor.b * (luminance / 127);
                             pixelData[pos + 3] = currentColor.a * pixelData[pos + 3];
                         }
                     }
                 }
                 canvasContext.putImageData(imgData,0,0);
                 
             } else {
                 canvasContext.drawImage(icon, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
             }
             
         };
         
         
         foxyProxy.svgIcons.setDefault = function setDefault() {
             canvasContext.save();
             canvasContext.clearRect(0, 0, canvas.width, canvas.height);

             canvasContext.translate(
                 Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
                 
             canvasContext.drawImage(icon, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));

             canvasContext.restore();

             chrome.browserAction.setIcon({
                 imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
             });
         };
         
         foxyProxy.svgIcons.setDisabled = function setDisabled() {

             canvasContext.save();
             canvasContext.clearRect(0, 0, canvas.width, canvas.height);

             canvasContext.translate(
                 Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));

             canvasContext.drawImage(icon, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));

             canvasContext.drawImage(iconDisabled, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));

             canvasContext.restore();

             chrome.browserAction.setIcon({
                 imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
             });
         };
        
        foxyProxy.svgIcons.init();
        foxyProxy.svgIcons.setDefault();
        
    }); //chrome.runtime.getBackgroundPage

    /*
     * Listen for beforeNavigate events and update foxyProxy icon
     */
    chrome.webNavigation.onBeforeNavigate.addListener(function( details) {
        if (foxyProxy.state != 'disabled') {
            var url = details.url;
            if (url) {
                foxyProxy.getProxyForUrl(url, function(url, proxy, pattern) {
                    if (proxy) {
                        if (foxyProxy.state == 'auto') {
                            foxyProxy.svgIcons.color = proxy.data.color;
                        }
                        
                        if (foxyProxy._settings && foxyProxy._settings.animateIcon) {
                            foxyProxy.svgIcons.throb(proxy);
                        }
                    } else {
                        foxyProxy.svgIcons.setDefault();
                    }
                });
            }
        }
    });


})();