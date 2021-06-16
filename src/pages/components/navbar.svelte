<script lang="ts">
	import { goto } from '$app/navigation';
	import { appuser, isUserLoggedIn, isAdmin, token, loggedInUserId } from '../../store';
	import axios from 'axios';
	import { getBase64, apihost, appModules, getAuthHeaders } from '../../appconfig';
	appuser.useLocalStorage();
	let src = '/images/hlogo.png';
	const login = () => goto('../account');
	const logout = () => {
		$appuser = {};
		localStorage.clear();
		goto('../account');
	};

	const handleProfileUpload = async (e) => {
		try {
			const file = e.target.files[0];
			const res = await getBase64(file);
			const body = {
				filename: file.name,
				profile: res,
				imagebucket: 'avatar',
				fileExtention: file.type
			};
			const url = `${apihost}/${appModules.upload}/${$loggedInUserId}`;
			const headers = getAuthHeaders($token);
			const result = await axios.post(url, body, headers).then((res) => res.data);
			if (result) {
				$appuser = { ...$appuser, ['photoURL']: result.photoURL };
			}
		} catch (error) {
			console.error(error);
		}
	};
</script>

<header>
	<div class="container">
		<nav class="navbar is-transparent" role="navigation" aria-label="main navigation">
			<div class="navbar-brand">
				<img alt="maahita logo" class="image" {src} />
			</div>
			<div class="navbar-end navbar-menu">
				<div class="navbar-item">
					{#if !$isUserLoggedIn}
						<div class="buttons">
							<button on:click={login} class="button is-primary">
								<span class="icon"> <i class="fas fa-sign-in-alt" /> </span>
								<span>Login</span>
							</button>
						</div>
					{:else}
						<div class="user-profile"><span>{$appuser['displayName']}</span></div>
						<label
							for="profilepic"
							style="cursor:pointer;display:flex;margin-right:10px;"
							title="click on image to upload"
						>
							{#if $appuser['photoURL']}
								<figure class="figure">
									<img class="profilepic" src={$appuser['photoURL']} alt="" />
								</figure>
							{:else}
								<span class="icon" style="margin-right: 5px;">
									<i class="far fa-2x fa-user-circle" />
								</span>
							{/if}
						</label>
						<input
							class="input is-hidden"
							type="file"
							name="profilepic"
							on:change={handleProfileUpload}
							accept="image/x-png,image/jpg,image/jpeg"
							id="profilepic"
						/>
						{#if $isAdmin}
							<div class="navbar-item is-hoverable">
								<span class="icon" style="cursor:pointer;margin-right: 5px;">
									<i class="fas fa-2x fa-align-justify" />
								</span>
								<div class="navbar-dropdown is-boxed" style="margin-left: -8rem;">
									<a class="navbar-item" href="/admin">Presenters</a>
									<a class="navbar-item" href="/sessionrequest"> Session Requests </a>
								</div>
							</div>
						{/if}
						<span on:click={logout} class="icon" style="cursor:pointer;">
							<i class="fas fa-2x fa-sign-out-alt" />
						</span>
					{/if}
				</div>
			</div>
		</nav>
	</div>
</header>

<style>
	.image {
		max-height: 4rem !important;
	}
	.container {
		max-width: 95vw;
	}
	header {
		-webkit-box-shadow: 0px 5px 5px 0px rgba(229, 229, 229, 0.96);
		-moz-box-shadow: 0px 5px 5px 0px rgba(229, 229, 229, 0.96);
		box-shadow: 0px 5px 5px 0px rgba(229, 229, 229, 0.96);
		background-color: white;
		padding: 5px;
	}
	.user-profile {
		font-size: 1.4rem;
		margin-right: 12px;
	}
	.figure {
		margin-right: 10px;
		margin-top: 5px;
	}
	.profilepic {
		border-radius: 50%;
		height: 35px;
		width: 30px;
		border: solid 1px #e5e5e5;
	}
</style>
