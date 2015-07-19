

function initMenuToggle() {
	$('[data-behavior="toggle-menu"]').click(function(e){
		e.preventDefault();
		$('[data-object="menu-object"]').toggleClass('is-open');
	});
}

$( document ).ready(function() {
    initMenuToggle();
});