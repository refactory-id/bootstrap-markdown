$(function(){
	$('button[type="submit"]').click(function(){
		var form = $(this).parent(),
			formResult = [],
			res = $('<pre/>',{
				'class':'prettyprint'
			})

		$.each($('.md-editor'),function(k,v){
			$(v).data('blur')()
		})

		$.each(form.serializeArray(),function(k,v){
			formResult.push(v.name+' => '+v.value)
		})

		res.html('\n'+formResult.join('\n\n')+'\n')
		form.replaceWith(res)

		return false
	})

	console.log(marked('<p>Foo is bar</p>'));
})