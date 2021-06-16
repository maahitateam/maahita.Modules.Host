<script lang="ts">
	import axios from 'axios';
	import { onMount } from 'svelte';
	import { apihost, appModules } from '../../appconfig';
	import { appuser } from '../../store.js';
	import { goto } from '$app/navigation';
	let userObj = {
		email: '',
		password: ''
	};

	let hasError: boolean = false;
	let error_message: string = '';
	$: cssClasses = ['button', 'is-primary', 'input'];

	let redirect_components = {
		admin: '../../admin/',
		presenter: '../../presenter',
		user: '../../user/'
	};

	onMount(() => {
		localStorage.clear();
	});

	async function handleSubmit() {
		try {
			cssClasses = [...cssClasses, 'is-loading'];
			const url = apihost + '/' + appModules.user + '/signin';
			const loggedInuser = await axios.post(url, userObj).then((res) => res.data);
			if (loggedInuser) {
				$appuser = { isLoggedIn: true, ...loggedInuser };
				const claim = loggedInuser.customClaims.claim;
				goto(redirect_components[claim]);
			}
		} catch (error) {
			hasError = true;
			error_message = 'Invalid login details';
			cssClasses = cssClasses.filter((c) => c !== 'is-loading');
		}
	}
</script>

<section class="hero is-fullheight-with-navbar">
	<div class="hero-body" style="padding: 0px;border-top: solid 1px #E5E5E5;">
		<div class="container" style="margin-top:-10rem;">
			<div class="box">
				<form name="userLogin" on:submit|preventDefault={handleSubmit}>
					<div class="field">
						<label class="label" for="email">Email</label>
						<div class="control has-icons-left has-icons-right">
							<input
								class="input"
								name="email"
								type="email"
								required
								title="Enter valid email address abcd@example.com"
								bind:value={userObj.email}
								placeholder="Email input"
							/>
							<span class="icon is-small is-left">
								<i class="fas fa-envelope" />
							</span>
						</div>
					</div>
					<div class="field">
						<label class="label" for="password">Password</label>
						<div class="control has-icons-left has-icons-right">
							<input
								class="input"
								type="password"
								name="password"
								title="Enter valid password no less than 6 characters"
								min="6"
								max="14"
								required
								bind:value={userObj.password}
								placeholder="Password input"
							/>
							<span class="icon is-small is-left">
								<i class="fas fa-envelope" />
							</span>
							<span class="icon is-small is-left">
								<i class="fas fa-lock" />
							</span>
						</div>
					</div>
					<div class="field">
						<div class="control">
							<button class={cssClasses.join(' ')} type="submit">
								<span class="icon is-small">
									<i class="fas fa-sign-in-alt" />
								</span>
								<span>Login to māhita</span>
							</button>
						</div>
					</div>
					{#if hasError}
						<article class="message is-danger">
							<div class="message-header">
								<p>{error_message}</p>
								<button class="delete" aria-label="delete" />
							</div>
						</article>
					{/if}
				</form>
			</div>
		</div>
	</div>
</section>

<style>
	.container {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
	.box {
		width: 35rem;
	}
	input[type='email']:invalid,
	input[type='email']:not(:placeholder-shown):invalid {
		color: red;
	}
	input[type='password']:invalid,
	input[type='password']:not(:placeholder-shown):invalid {
		color: red;
	}
</style>
