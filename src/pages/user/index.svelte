<script>
  import { onMount } from "svelte";
  import axios from "axios";

  import TitleBar from "../components/title.svelte";
  import ProgressBar from "../components/progressbar.svelte";
  import Modal from "../components/modal.svelte";
  import SessionCard from "../components/sessioncard.svelte";
  import Meeting from "../components/meeting.svelte";
  import Notify from "../components/notify.svelte";
  import {
    apihost,
    appModules,
    getDateParts,
    getAuthHeaders,
  } from "../../config";
  import { sessions, loggedInUserId, token } from "../../store";

  $: notifyConfig = {
    cssClass: "is-info",
  };

  let module_config = {
    showModal: false,
    is_loading: false,
    show_notification: false,
  };

  onMount(async () => {
    module_config.is_loading = true;
    const url = apihost + "/" + appModules.session;
    const result = await axios
      .get(url, getAuthHeaders($token))
      .then((res) => res.data);
    $sessions = result
      .map((data) => getDateParts(data, "scheduledon"))
      .sort((a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"]));
    module_config.is_loading = false;
  });

  const enroll = async (session) => {
    try {
      const id = $loggedInUserId;
      const url = `${apihost}/${appModules.session}/enroll/${id}`;
      const result = await axios
        .post(url, session, getAuthHeaders($token))
        .then((res) => res.data);
      if (result) {
        notifyConfig = {
          cssClass: "is-info",
          message: `Successfully enrolled for ${session.title}`,
        };
        module_config.show_notification = true;
      }
    } catch (error) {
      notifyConfig = {
        cssClass: "is-error",
        message: `Issue encountered to enroll for ${session.title}`,
      };
      module_config.show_notification = true;
    }
  };
  const modalClose = () => (module_config.showModal = false);
  const closenotify = () => {
    module_config.show_notification = false;
  };
</script>

<style>
  .container {
    scroll-behavior: smooth;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 70%;
  }
</style>

<div class="container">
  {#if module_config.is_loading}
    <ProgressBar module="session" />
  {:else}
    <TitleBar message="Current Sessions in māhita" />
    {#each $sessions as session}
      <SessionCard
        on:click={() => enroll(session)}
        role="user"
        data={session} />
    {/each}
  {/if}
  {#if module_config.showModal}
    <Modal
      on:click={modalClose}
      message="Please login to the system to enroll" />
  {/if}
  <Meeting />
  {#if module_config.show_notification}
    <Notify on:closenotify={closenotify} config={notifyConfig} />
  {/if}
</div>
