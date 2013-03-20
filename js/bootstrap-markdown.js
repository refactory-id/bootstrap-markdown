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
   * ========================== */

  var Markdown = function (element, options) {
    // Class Properties
    this.$ns       = 'bootstrap-markdown'
    this.$element  = $(element)
    this.$editable = {el:null, type:null,attrKeys:[], attrValues:[], content:null}
    this.$options  = $.extend(true, {}, $.fn.markdown.defaults, options)
    this.$editor   = null
    this.$textarea = null
    this.$handler  = []
    this.$callback = []

    this.showEditor()
  }

  Markdown.prototype = {

    constructor: Markdown

  , showEditor: function() {
      var textarea, 
          ns = this.$ns,
          container = this.$element,
          editable = this.$editable,
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

        // Build the main buttons
        if (options.buttons.length > 0) {
          editorHeader = this.buildButtons(options.buttons, editorHeader)
        }

        // Build the additional buttons
        if (options.additionalButtons.length > 0) {
          editorHeader = this.buildButtons(options.additionalButtons, editorHeader)
        }

        editor.append(editorHeader)

        // Wrap the textarea
        if (container.is('textarea')) {
          container.before(editor)
          textarea = container
          textarea.addClass('md-input')
          editor.append(textarea)
        } else {
          // This is some arbitrary content that could be edited
          textarea = $('<textarea/>', {
                       'class': 'md-input',
                       'val' : container.html()
                      })

          editor.append(textarea)

          // Save the editable
          editable.el = container
          editable.type = container.prop('tagName').toLowerCase()
          editable.content = container.html()

          $(container[0].attributes).each(function(){
            editable.attrKeys.push(this.nodeName)
            editable.attrValues.push(this.nodeValue)
          })

          // Set editor to blocked the original container
          container.replaceWith(editor)
        }

        textarea
          .on('focus',    $.proxy(this.focus, this))
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
                              +'"><i class="icon icon-ok"></i> Save</button>')

          editor.append(editorFooter)
        }

        // Reference
        this.$editor = editor
        this.$textarea = textarea
        this.$editable = editable

        // Set editor attributes, data short-hand API and listener
        this.$editor.attr('id',(new Date).getTime())
        this.$editor.data('getContent', $.proxy(this.getContent, this))
        this.$editor.data('setContent', function(content) {
          $.proxy(this.setContent, content)
        })
        this.$editor.data('getSelection', $.proxy(this.getSelection, this))
        this.$editor.data('replaceSelection', function(text) {
          $.proxy(this.replaceSelection, text)
        })
        this.$editor.data('blur', $.proxy(this.blur, this))
        this.$editor.on('click', '[data-provider="bootstrap-markdown"]', $.proxy(this.handle, this))

      } else {
        this.$editor.show()
      }

      this.$textarea.focus()
      this.$editor.addClass('active')

      options.onShow(this.$editor)
    }

  , buildButtons: function(buttonsArray, container) {
      var i,
          ns = this.$ns,
          handler = this.$handler,
          callback = this.$callback

      for (i=0;i<buttonsArray.length;i++) {
        // Build each group container
        var y, btnGroups = buttonsArray[i]
        for (y=0;y<btnGroups.length;y++) {
          // Build each button group
          var z,
              buttons = btnGroups[y].data,
              btnGroupContainer = $('<div/>', {
                                    'class': 'btn-group'
                                  })

          for (z=0;z<buttons.length;z++) {
            var button = buttons[z],
                buttonHandler = ns+'-'+button.name,
                btnText = button.btnText ? button.btnText : '',
                btnClass = button.btnClass ? button.btnClass : 'btn'

            // Attach the button object
            btnGroupContainer.append('<button class="'
                                    +btnClass
                                    +' btn-small" title="'
                                    +button.title
                                    +'" data-provider="'
                                    +ns
                                    +'" data-handler="'
                                    +buttonHandler
                                    +'"><i class="'
                                    +button.icon
                                    +'"></i> '
                                    +btnText
                                    +'</button>')

            // Register handler and callback
            handler.push(buttonHandler)
            callback.push(button.callback)
          }

          // Attach the button group into container dom
          container.append(btnGroupContainer)
        }
      }

      // Remove any tooltips
      container.children().children().each(function(k,v){
        //console.log('btnData',$(v).data())
      })

      return container
    }

  , getContent: function() {
      var textarea = this.$textarea

      return textarea.val()
    }

  , setContent: function(content) {
      var textarea = this.$textarea

      return textarea.val(content)
    }

  , getSelection: function() {

      var e = this.$textarea[0]

      return (

          ('selectionStart' in e && function() {
              var l = e.selectionEnd - e.selectionStart;
              return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
          }) ||

          /* browser not supported */
          function() { 
            return null; 
          }

      )();

    }

  ,  replaceSelection: function(text) {

      var e = this.$textarea[0]

      return (

          ('selectionStart' in e && function() {
              e.value = e.value.substr(0, e.selectionStart) + text + e.value.substr(e.selectionEnd, e.value.length);
              // Set cursor to the last replacement end
              e.selectionStart = e.value.length
              return this;
          }) ||

          /* browser not supported */
          function() {
              e.value += text;
              return jQuery(e);
          }

      )();

    }

  , handle: function(e) {
      var target = $(e.currentTarget),
          handler = this.$handler,
          callback = this.$callback,
          handlerName = target.attr('data-handler'),
          callbackIndex = handler.indexOf(handlerName),
          callbackHandler = callback[callbackIndex]

      // Trigger the focusin
      $(e.currentTarget).focus()

      callbackHandler(this)

      // Unless it was the save handler,
      // focusin the textarea
      if (handlerName.indexOf('cmdSave') < 0) {
        this.$textarea.focus()
      }

      e.preventDefault()
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

      // Blur other markdown(s)
      $(body).find('.md-editor').each(function(){
        var md = $(this).data()
        if ($(this).attr('id') != editor.attr('id')) {
          md.blur()
        }
      })
    }

  , blur: function (e) {
      var options = this.$options,
          isHideable = options.hideable,
          editor = this.$editor,
          editable = this.$editable

      editor.removeClass('active')

      if (isHideable && typeof editor != "undefined") {
        // Check for editable elements
        if (editable.el != null) {
          // Build the original element
          var oldElement = $('<'+editable.type+'/>')

          $(editable.attrKeys).each(function(k,v) {
            oldElement.attr(editable.attrKeys[k],editable.attrValues[k])
          })

          // Get the editor content
          oldElement.html(this.getContent())

          editor.replaceWith(oldElement)
        } else {
          editor.hide()
          
        }

        options.onBlur(editor)
      }
    }

  }

 /* MARKDOWN PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.markdown

  $.fn.markdown = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('markdown')
        , options = typeof option == 'object' && option

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
      },{
        name: 'groupUtil',
        data: [{
          name: 'cmdPreview',
          title: 'Preview',
          btnText: 'Preview',
          btnClass: 'btn btn-inverse',
          icon: 'icon icon-search',
          callback: function(e){
            alert('Preview btn clicked')
          }
        }]
      }]
    ],
    additionalButtons:[], // Place to hook more buttons by code

    /* Events hook */
    onShow: function (e) {},
    onSave: function (e) {},
    onBlur: function (e) {}
  }

  $.fn.markdown.Constructor = Markdown


 /* MARKDOWN NO CONFLICT
  * ==================== */

  $.fn.markdown.noConflict = function () {
    $.fn.markdown = old
    return this
  }

  /* MARKDOWN GLOBAL FUNCTION & DATA-API
  * ==================================== */
  var initMarkdown = function(el) {
    var $this = el
    if ($this.data('markdown')) {
      $this.data('markdown').showEditor()
      return
    }
    console.log('iniMd:',$this)
    $this.markdown($this.data())
  }

  var analyzeMarkdown = function(e) {
    var blurred = false,
        el,
        md,
        $docEditor = $(e.currentTarget)

    if ((e.type == 'focusin' || e.type == 'click') && $docEditor.length == 1 && typeof $docEditor[0] == 'object'){
      el = $docEditor[0].activeElement
      if ( ! $(el).data('markdown')) {
        if (typeof $(el).parent().parent().parent().attr('class') == "undefined"
              || $(el).parent().parent().parent().attr('class').indexOf('md-editor') < 0) {
          if ( typeof $(el).parent().parent().attr('class') == "undefined"
              || $(el).parent().parent().attr('class').indexOf('md-editor') < 0) {
          
                blurred = true
          }
        } else {
          blurred = false
        }
      }

      if (blurred) {
        // Blur event
        $(body).find('.md-editor').each(function(){
          var parentMd = $(el).parent()
          md = $(this).data()

          if ($(this).attr('id') != parentMd.attr('id')) {
            md.blur()
          }
        })
      }

      e.stopPropagation()
    }
  }

  $(document)
    .on('click.markdown.data-api', '[data-provide="markdown-editable"]', function (e) {
      $(this).data('hideable',true)
      initMarkdown($(this))
      e.preventDefault()
    })
    .on('click', function (e) {
      analyzeMarkdown(e)
    })
    .on('focusin', function (e) {
      analyzeMarkdown(e)
    })
    .ready(function(){
      $('textarea[data-provide="markdown"]').markdown()
    })

}(window.jQuery);