/* ===================================================
 * bootstrap-markdown.js v1.0.0
 * http://github.com/toopay/bootstrap-markdown
 * ===================================================
 * Copyright 2013 Taufan Aditya
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function ($) {

  "use strict"; // jshint ;_;


  /* MARKDOWN CLASS DEFINITION
   * ======================================================= */

  var Markdown = function (element, options) {
    // Class Properties
    this.$ns       = 'bootstrap-markdown'
    this.$element  = $(element)
    this.$options  = $.extend(true, {}, $.fn.markdown.defaults, options)
    this.$editor   = null
    this.$textarea = null
    this.$handler  = []
    this.$callback = []

    this.listen()
  }

  Markdown.prototype = {

    constructor: Markdown

  , showEditor: function() {
      var textarea, 
          ns = this.$ns,
          container = this.$element,
          handler = this.$handler,
          callback = this.$callback,
          options = this.$options,
          editor = $( '<div/>', {
                      'class': 'md-editor',
                      click: function() {
                        $( this ).toggleClass( "test" );
                      }
                    })

      // Prepare the editor
      if (this.$editor == null) {
        // Create the panel
        var editorHeader = $('<div/>', {
                            'class': 'md-header'
                            })

        // Build the buttons
        if (options.buttons.length > 0) {
          var i
          for (i=0;i<options.buttons.length;i++) {
            // Build each group container
            var y, btnGroups = options.buttons[i]
            for (y=0;y<btnGroups.length;y++) {
              // Build each button group
              var z,
                  buttons = btnGroups[y].data,
                  btnGroupContainer = $('<div/>', {
                                        'class': 'btn-group'
                                      })

              for (z=0;z<buttons.length;z++) {
                var button = buttons[z],
                    buttonHandler = this.$ns+'-'+button.name

                // Attach the button object
                btnGroupContainer.append('<button class="btn btn-small" title="'
                                        +button.title
                                        +'" data-provider="'
                                        +ns
                                        +'" data-handler="'
                                        +buttonHandler
                                        +'"><i class="'
                                        +button.icon
                                        +'"></i></button>')

                // Register handler and callback
                handler.push(buttonHandler)
                callback.push(button.callback)
              }

              // Attach the button group into md-header panel
              editorHeader.append(btnGroupContainer)
            }
          }
        }

        editor.append(editorHeader)

        // Wrap the textarea
        if (container.is('textarea')) {
          container.before(editor)
          textarea = container
          textarea.addClass('md-input')
          editor.append(textarea)
        } else {
          textarea = $('<textarea/>', {
                       'class': 'md-input',
                       'val' : container.html()
                      })

          editor.append(textarea)
          container.append(editor)
        }

        textarea
          .on('focus',    $.proxy(this.focus, this))
          .on('blur',     $.proxy(this.inputBlur, this))
          .on('keypress', $.proxy(this.keypress, this))
          .on('keyup',    $.proxy(this.keyup, this))

        if (this.eventSupported('keydown')) {
          textarea.on('keydown', $.proxy(this.keydown, this))
        }


        // Create the footer if savable
        if (options.savable) {
          var editorFooter = $('<div/>', {
                           'class': 'md-footer'
                         }),
              saveHandler = 'cmdSave'

          // Register handler and callback
          handler.push(saveHandler)
          callback.push(options.onSave)

          editorFooter.append('<button class="btn btn-success" data-provider="'
                              +ns
                              +'" data-handler="'
                              +saveHandler
                              +'">Save</button>')

          editor.append(editorFooter)
        }

        this.$editor = editor
        this.$textarea = textarea

        // Set editor data short-hand API
        this.$editor.data('getContent', $.proxy(this.getContent))
        this.$editor.on('click', '[data-provider="bootstrap-markdown"]', $.proxy(this.handle, this))
        this.$editor.on('blur > *', $.proxy(this.blur, this))
      } else {
        this.$editor.show()
      }

      this.$textarea.focus()
      this.$editor.addClass('active')

      options.onShow(this.$editor)
    }

  , getContent: function() {
      var textarea = this.$textarea

      return textarea.val()
    }

  , handle: function(e) {
      var target = $(e.currentTarget),
          handler = this.$handler,
          callback = this.$callback,
          handlerName = target.attr('data-handler'),
          callbackIndex = handler.indexOf(handlerName),
          callbackHandler = callback[callbackIndex]

      callbackHandler(this)

      this.$textarea.focus()
      
      e.preventDefault()
    }

  , listen: function () {
      this.showEditor()
      
    }

  , eventSupported: function(eventName) {
      var isSupported = eventName in this.$element
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;')
        isSupported = typeof this.$element[eventName] === 'function'
      }
      return isSupported
    }

  , keydown: function (e) {
      this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27])
      this.keyup(e)
    }

  , keypress: function (e) {
      if (this.suppressKeyPressRepeat) return
      this.keyup(e)
    }

  , keyup: function (e) {
      var blocked = false
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break

        case 9: // tab
          blocked = true
          break

        case 13: // enter
        case 27: // escape
          blocked = false
          break

        default:
          blocked = false
      }

      if (blocked) {
        e.stopPropagation()
        e.preventDefault()
      }
  }

  , focus: function (e) {
      var options = this.$options,
          isHideable = options.hideable,
          editor = this.$editor

      editor.addClass('active')
    }

  , inputBlur: function (e) {
      /* Checking stuff? */
    }

  , blur: function (e) {
      var editorBlur = true,
          options = this.$options,
          isHideable = options.hideable,
          editor = this.$editor

      editor.children().each(function(index){
        var editorChild = editor.children()[index]
        if ($(editorChild).children().length > 0) {
          // Recursive inspection
          $(editorChild).children().each(function(subIndex){
            var editorGrandSon = $(editorChild).children()[subIndex]

            console.log
            if($(editorGrandSon).children().is(':focus')) {
              alert('yay')
            }
          })
        }
      })

      alert(editorBlur)

      editor.removeClass('active')

      if (isHideable && typeof editor != "undefined" && editorBlur == true) {
        editor.hide()

        options.onBlur(editor)
      }
    }

  }

 /* MARKDOWN PLUGIN DEFINITION
  * ===================== */

  var old = $.fn.markdown

  $.fn.markdown = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('markdown')
        , options = typeof option == 'object' && option
      console.log(options)
      if (!data) $this.data('markdown', (data = new Markdown(this, options)))
    })
  };

  $.fn.markdown.defaults = {
    /* Editor Properties */
    hideable: false,
    savable:false,
    width: 'inherit',
    height: 'inherit',

    /* Buttons Properties */
    buttons: [
      [{
        name: 'groupFont',
        data: [{
          name: 'cmdBold',
          title: 'Bold',
          icon: 'icon icon-bold',
          callback: function(e){
            alert('Bold btn clicked')
          }
        },{
          name: 'cmdItalic',
          title: 'Italic',
          icon: 'icon icon-italic',
          callback: function(e){
            alert('Italic btn clicked')
          }
        }]
      },{
        name: 'groupLink',
        data: [{
          name: 'cmdUrl',
          title: 'URL/Link',
          icon: 'icon icon-globe',
          callback: function(e){
            alert('URL btn clicked')
          }
        },{
          name: 'cmdImage',
          title: 'Image',
          icon: 'icon icon-picture',
          callback: function(e){
            alert('Image btn clicked')
          }
        }]
      },{
        name: 'groupMisc',
        data: [{
          name: 'cmdList',
          title: 'List',
          icon: 'icon icon-list',
          callback: function(e){
            alert('List btn clicked')
          }
        },{
          name: 'cmdTable',
          title: 'Table',
          icon: 'icon icon-th',
          callback: function(e){
            alert('Table btn clicked')
          }
        }]
      }]
    ],

    /* Events hook */
    onShow: function (e) {},
    onSave: function (e) {},
    onBlur: function (e) {}
  }

  $.fn.markdown.Constructor = Markdown


 /* MARKDOWN NO CONFLICT
  * =============== */

  $.fn.markdown.noConflict = function () {
    $.fn.markdown = old
    return this
  }

  /* MARKDOWN DATA-API
  * ================== */
  var initMarkdown = function(el) {
    var $this = el
    if ($this.data('markdown')) {
      $this.data('markdown').showEditor()
      return
    }

    $this.markdown($this.data())
  }

  $(document)
    .on('click.markdown.data-api', '[data-provide="markdown-editable"]', function (e) {
      $(this).data('hideable',true)
      initMarkdown($(this))
      e.preventDefault()
    })
    .ready(function(){
      $('textarea[data-provide="markdown"]').markdown()
    })

}(window.jQuery);