<script lang="ts">
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let config = {
		cssClass: '',
		message: ''
	};
	const closeNotifiy = () => dispatch('closenotify', false);
</script>

<div transition:fade={{ duration: 1000 }} class="notification is-light {config.cssClass}">
	<button on:click={closeNotifiy} class="delete" />
	{config.message}
</div>

<style>
	.notification {
		max-width: 400px;
		margin-right: 30px;
		top: 30px;
		position: absolute;
		z-index: 100;
		box-sizing: border-box;
		border-radius: 5px;
		right: 0%;
		opacity: 1;
		animation: scaleme 1s;
	}

	@keyframes scaleme {
		0% {
			-webkit-transform: scale(1);
			opacity: 1;
		}
		100% {
			-webkit-transform: scale(1);
			opacity: 0;
			display: none;
		}
	}
</style>
