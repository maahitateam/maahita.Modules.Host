<script lang="ts">
	export let message = 'Currently Active Sessions';
	export let iserror = false;
	let cssClasses = ['section'];
	if (iserror) {
		cssClasses.push('has-text-danger');
	}
</script>

<section class="section">
	<h3 class={iserror ? 'has-text-danger' : 'has-text-black'}>{message}</h3>
</section>

<style>
	section {
		height: 70px;
		font-size: 1.7rem;
		text-align: center;
		padding: 10px;
		font-weight: 700;
		font-family: 'Comfortaa';
	}
</style>
