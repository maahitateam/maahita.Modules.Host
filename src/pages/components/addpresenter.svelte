<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import axios from 'axios';
	import { token } from '../../store';
	import { IPresenter } from 'src/interfaces';
	import { hasKey, getBase64, apihost, appModules, getAuthHeaders } from '../../appconfig';
	const dispatch = createEventDispatcher();
	export let add = 'true';
	export let edit = 'false';
	export let close = 'false';
	export let admin = 'true';
	export let presenterdata: IPresenter;
	onMount(() => {
		if (hasKey(presenterdata, 'dateofbirth')) {
			presenterdata['dateofbirth'] = new Date(
				presenterdata['dateofbirth'].toString().split('T')[0]
			);
		}
	});

	const handleSubmit = async () => dispatch('submitpresenter', presenterdata);
	const handleClose = async (e: any) => {
		e.preventDefault();
		dispatch('closeAddPresenter', { close: true });
	};
	const handleProfileUpload = async (e: any) => {
		try {
			const file = e.target.files[0];
			const res = await getBase64(file);
			const body = {
				filename: file.name,
				profile: res,
				imagebucket: 'avatar',
				fileExtention: file.type
			};
			const url = `${apihost}/${appModules.upload}/${presenterdata.id}`;
			const headers = getAuthHeaders($token);
			const result = await axios.post(url, body, headers).then((res) => res.data);
			console.log(result);
			if (result) {
				presenterdata = { ...presenterdata, profile_pic: result.profile_pic };
			}
		} catch (error) {
			console.error(error);
		}
	};
</script>

<section>
	<form name="addpresenter" on:submit|preventDefault={handleSubmit}>
		<div class="box">
			{#if close === 'true'}
				<header class="is-pulled-right">
					<button type="button" class="delete" on:click={handleClose} aria-label="close" />
				</header>
			{/if}
			<article class="media">
				<div class="media-left" style="width: 50%;margin-right: 0rem !important;padding: 10px;">
					<div class="field">
						<div class="control" style="text-align:center;">
							{#if presenterdata.profile_pic}
								<figure class="figure">
									<img
										src={presenterdata.profile_pic}
										class="profile"
										alt="presenter profile pic"
									/>
								</figure>
							{:else}
								<label
									class="image"
									title="click on image to upload"
									for="profilepic"
									style="font-size:3.4rem; text-align:center;cursor:pointer;"
								>
									<span>
										<i class="far fa-3x fa-user-circle" />
									</span>
								</label>
							{/if}
							<label for="note ">
								<span name="note" class="has-text-danger has-text-weight-bold is-size-7">
									* click on image to update
								</span>
							</label>
							<input
								class="input is-hidden"
								type="file"
								name="profilepic"
								on:change={handleProfileUpload}
								accept="image/x-png,image/jpg,image/jpeg"
								id="profilepic"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="displayname">Full Name</label>
						<div class="control">
							<input
								class="input"
								name="displayname"
								type="text"
								required
								bind:value={presenterdata.displayname}
								placeholder="Presenter Fullname"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="email">Email</label>
						<div class="control">
							<input
								class="input"
								type="email"
								name="email"
								required
								bind:value={presenterdata.work_email}
								placeholder="Presenter Email"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="phone">Phone</label>
						<div class="control">
							<input
								class="input"
								type="text"
								name="phone"
								required
								bind:value={presenterdata.work_phone}
								placeholder="+1234567890"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="description">Description</label>
						<div class="control">
							<textarea
								class="input"
								type="text"
								name="description"
								required
								bind:value={presenterdata.description}
								placeholder="Enter bio about presenter"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="dateofbirth">Date of birth</label>
						<div class="control">
							<input
								class="input"
								type="date"
								name="dateofbirth"
								required
								bind:value={presenterdata.dateofbirth}
								placeholder="Presenter Birthday"
							/>
						</div>
					</div>
				</div>
				<div class="media-right" style="width: 50%;margin-left: 0rem !important;padding: 20px;">
					<div class="field">
						<label class="label" for="education">Education</label>
						<div class="control">
							<input
								class="input"
								type="text"
								name="education"
								required
								bind:value={presenterdata.qualification}
								placeholder="Highest Education Details"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="skills">Skills</label>
						<div class="control">
							<input
								class="input"
								type="text"
								name="skills"
								required
								bind:value={presenterdata.skills}
								placeholder="Enter skills with comma separated"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="college">College</label>
						<div class="control">
							<input
								class="input"
								type="text"
								name="college"
								required
								bind:value={presenterdata.college}
								placeholder="Highest College Details"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="address">Address</label>
						<div class="control">
							<input
								class="input"
								type="text"
								name="address"
								required
								bind:value={presenterdata.address}
								placeholder="Presenter Address"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="city">City</label>
						<div class="control">
							<input
								class="input"
								type="text"
								name="city"
								required
								bind:value={presenterdata.city}
								placeholder="Upload profile pic"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="state">State</label>
						<div class="control">
							<input
								class="input"
								type="text"
								name="state"
								required
								bind:value={presenterdata.state}
								placeholder="Presenter State"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="country">Country</label>
						<div class="control">
							<input
								class="input"
								type="text"
								name="country"
								required
								bind:value={presenterdata.country}
								placeholder="Presenter Country"
							/>
						</div>
					</div>
					{#if add === 'true'}
						<div class="field">
							<label class="label" style="cursor:pointer;">
								New User
								<input
									type="radio"
									name="usercategory"
									value="new_user"
									title="Allow user to login with this email"
									required
									bind:group={presenterdata.usercategory}
								/>
							</label>
						</div>
						<div class="field">
							<label class="label" style="cursor:pointer;">
								Existing User
								<input
									type="radio"
									name="usercategory"
									value="existing_user"
									title="Are you making existing user as presenter"
									required
									bind:group={presenterdata.usercategory}
								/>
							</label>
						</div>
						<div class="field">
							<div class="control">
								<button class="button is-primary" type="submit">
									<span class="icon">
										<i class="fas fa-save" />
									</span>
									<span>Submit</span>
								</button>
							</div>
						</div>
					{/if}
					{#if edit === 'true'}
						<div class="field">
							<div class="buttons is-pulled-right">
								<button class="button is-primary">
									<span class="icon">
										<i class="far fa-save" />
									</span>
									<span>Save Changes</span>
								</button>
								{#if admin === 'true'}
									<button class="button is-danger">
										<span class="icon">
											<i class="fas fa-trash" />
										</span>
										<span>Remove Presenter</span>
									</button>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</article>
		</div>
	</form>
</section>

<style>
	.profile {
		border-radius: 50%;
		height: 210px;
		width: 210px;
	}
</style>
