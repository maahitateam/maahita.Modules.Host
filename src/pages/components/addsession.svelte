<script>
  import { createEventDispatcher, onMount } from "svelte";
  import axios from "axios";
  import { appRoles } from "../../config";
  import { token, current_presenter } from "../../store";
  import {
    hasKey,
    apihost,
    appModules,
    getAuthHeaders,
    getDateParts,
    session_remove,
    removeUnusedFields,
  } from "../../config.js";
  const dispatch = createEventDispatcher();
  export let role = "user";
  export let add = "true";
  export let edit = "false";
  export let sessiondata = {};
  export let currentpresenter = {};
  let today = new Date();
  let minDate = today.toISOString().slice(0, 16);
  console.log(minDate);
  onMount(() => {
    console.log(currentpresenter);
    if (hasKey(sessiondata, "scheduledon")) {
      sessiondata["scheduledon"] = sessiondata["scheduledon"].slice(0, 16);
    }
  });
  const handleSessionSubmit = async () => {
    // after save dispatch to parent to update list
    console.log(role);
    try {
      let url = "";
      const headers = getAuthHeaders($token);
      const updateObj = removeUnusedFields(sessiondata, session_remove);
      const data = {
        ...updateObj,
        presenter: currentpresenter.displayName,
        presenterid: currentpresenter.id,
        photoURL: currentpresenter.photoURL,
      }; // session with presenter info.

      if (hasKey(sessiondata, "id")) {
        url = `${apihost}/${appModules.session}/${sessiondata.id}`;
        data.createdby = currentpresenter.id;
        data.updatedby = currentpresenter.id;
        const result = await axios
          .put(url, data, headers)
          .then((res) => res.data);
        const sessionwithdate = getDateParts(result, "scheduledon");
        dispatch("submitsession", { isadd: false, ...sessionwithdate });
      } else {
        url = `${apihost}/${appModules.session}`;
        data.createdby = currentpresenter.id;
        data.updatedby = currentpresenter.id;
        const result = await axios
          .post(url, data, headers)
          .then((res) => res.data);
        const sessionwithdate = getDateParts(result, "scheduledon");
        dispatch("submitsession", { isadd: true, ...sessionwithdate });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmitRequest = async () => {
    try {
      let url = "";
      const headers = getAuthHeaders($token);
      const updateObj = removeUnusedFields(sessiondata, session_remove);
      const data = {
        ...updateObj,
        presenter: currentpresenter.displayName,
        presenterid: currentpresenter.id,
        photoURL: currentpresenter.photoURL,
      }; // session with presenter info.
      url = `${apihost}/${appModules.sessionrequest}`;
      data.status = 100;
      data.createdby = currentpresenter.id;
      data.updatedby = currentpresenter.id;
      const result = await axios
        .post(url, data, headers)
        .then((res) => res.data);
      dispatch("submitrequest", result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = async (e) => {
    e.preventDefault();
    dispatch("closeaddsession", { close: true });
  };
</script>

<style>
  .flex-start {
    display: flex;
    justify-content: flex-start;
  }
  .w25 {
    width: 25%;
  }
  .mr10 {
    margin-right: 10px;
  }
</style>

<div class="box">
  <form name="addsession" on:submit|preventDefault={handleSessionSubmit}>
    <header class="is-pulled-right">
      <button
        type="button"
        class="delete"
        on:click={handleClose}
        aria-label="close" />
    </header>
    <div class="container flex-start">
      <div class="field w25 mr10">
        <label class="label">Title</label>
        <div class="control">
          <input
            class="input"
            name="title"
            type="text"
            required
            bind:value={sessiondata.title}
            placeholder="Session Title" />
        </div>
      </div>
      <div class="field w25 mr10">
        <label class="label">Description</label>
        <div class="control">
          <textarea
            class="input"
            type="text"
            name="description"
            required
            bind:value={sessiondata.description}
            placeholder="Session description" />
        </div>
      </div>
      <div class="field w25 mr10">
        <label class="label">Scheduled Date</label>
        <div class="control">
          <input
            class="input"
            type="datetime-local"
            name="scheduledon"
            min={minDate}
            required
            bind:value={sessiondata.scheduledon}
            placeholder="Scheduled Date" />
        </div>
      </div>
      <div class="field w25 mr10">
        <label class="label">Theme</label>
        <div class="control">
          <input
            class="input"
            type="text"
            name="theme"
            required
            bind:value={sessiondata.theme}
            placeholder="Session Theme" />
        </div>
      </div>
    </div>
    <div class="container flex-start" style="align-items:flex-end;">
      <div class="field mr10">
        <label class="label" style="cursor:pointer;">
          <input
            name="category"
            type="checkbox"
            bind:checked={sessiondata.livestream} />
          You Tube Streaming
        </label>
      </div>
      <div class="field mr10">
        <label class="label" style="cursor:pointer;">
          <input
            name="category"
            type="checkbox"
            bind:checked={sessiondata.notification} />
          Send Notification
        </label>
      </div>

      {#if add === 'true'}
        {#if role === appRoles.admin}
          <div class="field mr10">
            <div class="control">
              <button class="button is-primary" type="submit">
                <span class="icon is-small">
                  <i class="fas fa-save" />
                </span>
                <span>Submit</span>
              </button>
            </div>
          </div>
        {:else}
          <div class="field mr10">
            <div class="control">
              <button
                class="button is-primary"
                type="button"
                on:click={handleSubmitRequest}>
                <span class="icon is-small">
                  <i class="fas fa-save" />
                </span>
                <span>Submit Request</span>
              </button>
            </div>
          </div>
        {/if}
      {/if}
      {#if edit === 'true'}
        <div class="field mr10">
          <div class="buttons">
            <button
              type="submit"
              on:submit={handleSessionSubmit}
              class="button is-primary">
              <span class="icon">
                <i class="far fa-save" />
              </span>
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </form>
</div>
