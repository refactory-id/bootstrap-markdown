$(function(){
	$('button[type="submit"]').click(function(){
		var form = $(this).parent(),
			formResult = [],
			res = $('<pre/>',{
				'class':'prettyprint'
			})

		$.each(form.serializeArray(),function(k,v){
			formResult.push(v.name+' => '+v.value)
		})

		res.html('\n'+formResult.join('\n\n')+'\n')
		form.replaceWith(res)

		return false
	})

	$('#target-editor-with-custom-buttons').markdown({
		additionalButtons: [
			[{
		        name: 'groupCustom',
		        data: [{
		          name: 'cmdBeer',
		          title: 'Beer',
		          icon: 'glyphicon glyphicon-glass',
		          callback: function(e){
		            // Replace selection with some drinks
		            var chunk, cursor, selected = e.getSelection(), content = e.getContent(),
		            	drinks = ['Heinekken', 'Budweiser', 'Iron City', 'Amstel Light', 'Red Stripe', 'Smithwicks', 'Westvleteren', 'Sierra Nevada', 'Guinness', 'Corona', 'Calsberg'],
		            	index = Math.floor((Math.random()*10)+1)


	              	// Give random drink
	              	chunk = drinks[index]

		            // transform selection and set the cursor into chunked text
	              	e.replaceSelection(chunk)
		            cursor = selected.start

		            // Set the cursor
		            e.setSelection(cursor,cursor+chunk.length)
		          }
		        }]
			}]
		]
	})

	$('#target-editor-twitter').markdown({
		hiddenButtons:'cmdPreview',
		footer:'<div id="twitter-footer" class="well" style="display:none;"></div><small id="twitter-counter" class="text-success">140 character left</small>',
		onChange:function(e){
			var content = e.parseContent(),
				content_length = (content.match(/\n/g)||[]).length + content.length

			if (content == '') {
				$('#twitter-footer').hide()
			} else {
				$('#twitter-footer').show().html(content)
			}

			if (content_length > 140) {
				$('#twitter-counter').removeClass('text-success').addClass('text-danger').html(content_length-140+' character surplus.')
			} else {
				$('#twitter-counter').removeClass('text-danger').addClass('text-success').html(140-content_length+' character left.')
			}
		}
	})

	$('#target-editor-with-custom-language').markdown({language:'fr'})

	$('#target-fa-editor').markdown({iconlibrary: 'fa'})

	$('#editor-triger-init').click(function(){
		$('#target-editor').markdown({
			savable:true,
			onShow: function(e){
				alert('Showing '
					+e.$textarea.prop('tagName').toLowerCase()
					+'#'
					+e.$textarea.attr('id')
					+' as Markdown Editor...')
			},
			onPreview: function(e) {
				var previewContent

				if (e.isDirty()) {
					var originalContent = e.getContent()

					previewContent = 'Prepended text here...'
								 + "\n"
								 + originalContent
								 + "\n"
								 +'Apended text here...'
				} else {
					previewContent = 'Default content'
				}

				return previewContent
			},
			onChange: function(e) {
				console.log('Changed!')
			},
			onSave: function(e) {
				alert('Saving "'+e.getContent()+'"...')
			},
			onFocus: function(e) {
				// Since focusin event will fired until the focusout
				// sometime we may want to only do something
				// when focus occurs in the first time only
				if (!$(e.$element).data('focused')) {
					alert('Focus triggered!')
					$(e.$element).data('focused', true)
				}
			},
			onBlur: function(e) {
				alert('Blur triggered!')

				// Remove focus flag
				$(e.$element).data('focused', null)
			}
		})

		$(this).hide()
		return false
	})
})