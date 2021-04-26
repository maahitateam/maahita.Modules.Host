<script>
  import { onMount } from "svelte";
  import axios from "axios";

  import TitleBar from "./components/title.svelte";
  import ProgressBar from "./components/progressbar.svelte";
  import Modal from "./components/modal.svelte";
  import SessionCard from "./components/sessioncard.svelte";

  import { apihost, appModules, getDateParts } from "../config.js";
  import { appuser, sessions } from "../store";
  appuser.useLocalStorage(); // enable local storage

  let showModal = false;
  let isLoading = false;

  onMount(async () => {
    isLoading = true;
    const url = apihost + "/" + appModules.session + "/public";
    const result = await axios.get(url).then((res) => res.data);
    $sessions = result
      .map((data) => getDateParts(data, "scheduledon"))
      .sort((a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"]));
    isLoading = false;
  });

  const enroll = () => {
    if (!$appuser.isLoggedIn) {
      showModal = true;
    }
  };
  const handleShowModal = () => {
    showModal = true;
  };
  const modalClose = () => (showModal = false);
</script>

<style>
  .container {
    overflow: auto;
    scroll-behavior: smooth;
  }
</style>

<div class="container">
  {#if isLoading}
    <ProgressBar module="session" />
  {:else}
    <TitleBar message="Current Sessions in māhita" />
    {#each $sessions as session}
      <SessionCard
        on:handleShowModal={handleShowModal}
        on:click={enroll}
        role="user"
        data={session} />
    {/each}
  {/if}
  {#if showModal}
    <Modal
      on:click={modalClose}
      message="Please login to the system to enroll" />
  {/if}
</div>
