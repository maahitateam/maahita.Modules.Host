<script>
  import { createEventDispatcher, onMount } from "svelte";
  import axios from "axios";
  import {
    apihost,
    appModules,
    getAuthHeaders,
    hasKey,
    getExternalJitsiApi,
    meetinghost,
  } from "../../config";
  import { token, loggedInUserId, isUserLoggedIn, appuser } from "../../store";
  export let data = {};
  export let role = "user";
  const dispatch = createEventDispatcher();
  $: action_status = 1;
  onMount(() => {
    if (hasKey(data, "enrollments")) {
      data.isEnrolled = data.enrollments.includes($loggedInUserId);
    }
    action_status = data.status;
  });

  const handleEditSession = () => dispatch("editsession", data);
  const handleCancelSession = async () => {
    try {
      const headers = getAuthHeaders($token);
      const url = `${apihost}/${appModules.session}/${"cancel"}/${data.id}`;
      const result = await axios
        .put(url, data, headers)
        .then((res) => res.data);
      if (result) {
        action_status = result.status;
        dispatch("canelsession", result);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleStartSession = async () => {
    try {
      const headers = getAuthHeaders($token);
      const url = `${apihost}/${appModules.session}/${"start"}/${data.id}`;
      const result = await axios
        .put(url, data, headers)
        .then((res) => res.data);
      if (result) {
        data.meetingID = result.meetingID;
        action_status = result.status;
        dispatch("startsession", result);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleStopSession = async () => {
    try {
      const headers = getAuthHeaders($token);
      const url = `${apihost}/${appModules.session}/${"complete"}/${data.id}`;
      const result = await axios
        .put(url, data, headers)
        .then((res) => res.data);
      if (result) {
        action_status = result.status;
        dispatch("stopsession", result);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteSession = async () => {
    try {
      const headers = getAuthHeaders($token);
      const url = `${apihost}/${appModules.session}/${data.id}`;
      const result = await axios.delete(url, headers).then((res) => res.data);
      if (result) {
        action_status = result.status;
        dispatch("deletesession", data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleEnroll = async () => {
    try {
      if (!$isUserLoggedIn) {
        dispatch("handleShowModal", true);
        return;
      }
      const id = $loggedInUserId;
      const url = `${apihost}/${appModules.session}/enroll/${id}`;
      const result = await axios
        .post(url, data, getAuthHeaders($token))
        .then((res) => res.data);
      if (result) {
        data.isEnrolled = true;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const joinSession = async (data) => {
    var win = window.open(`https://${meetinghost}/${data.meetingID}`);
    win.focus();
    // const api = getExternalJitsiApi(data.meetingid, meetinghost, $appuser);
    // if (api) {
    //   document.getElementById("meeting").showModal();
    //   // styles are dynamically rendered, so need to configure the styles manually.
    //   setTimeout(() => {
    //     let iframe = document.querySelector("#meeting > #dialog-body")
    //       .childNodes[0];
    //     iframe.style["height"] = "85vh";
    //   }, 2000);
    // }
  };

  const sendNotification = async (data) => {
    try {
      const id = $loggedInUserId;
      const body = { title: data.title, message: `${data.title} is added` };
      const url = `${apihost}/${appModules.notify}/${id}`;
      const result = await axios
        .post(url, body, getAuthHeaders($token))
        .then((res) => res.data);
      if (result) {
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openSession = async (data) => {
    var win = window.open(`https://${meetinghost}/${data.meetingID}`);
    win.focus();
    // const api = getExternalJitsiApi(data.meetingid, meetinghost, $appuser);
    // if (api) {
    //   document.getElementById("meeting").showModal();
    //   // styles are dynamically rendered, so need to configure the styles manually.
    //   setTimeout(() => {
    //     let iframe = document.querySelector("#meeting > #dialog-body")
    //       .childNodes[0];
    //     let newWindow = window.open(`${meetinghost}/${data.meetingid}`);
    //     iframe.style["height"] = "85vh";
    //   }, 2000);
    // }
  };
</script>

<style>
  .box {
    padding: 0px;
  }
  .session-date {
    color: white;
    background-color: red;
    height: 4rem;
    font-size: 3rem;
    font-weight: bolder;
    width: 8rem;
    text-align: center;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .session-month {
    color: white;
    background-color: red;
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
  }
  .session-time {
    text-align: center;
    height: 2rem;
    border: solid red 1px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    padding-top: 2px;
  }
  .media-content {
    margin-left: 10px;
    margin-right: 10px;
  }
  .media-right {
    width: 10rem;
    text-align: center;
  }
  .image {
    height: 7rem;
    text-align: center;
    padding-top: 30px;
  }
  i {
    height: 100px !important;
    width: 100px !important;
  }
  .session-title {
    font-size: 2rem;
    font-weight: 600;
  }
  .session-description {
    font-size: 1.3rem;
    padding: 5px 0;
  }

  .session-theme {
    padding: 5px 0;
  }
  .profile {
    border-radius: 50%;
    height: 125px;
    width: 125px;
    margin: 10px auto;
  }

  .media {
    border: solid 1px #e5e5e5;
    border-radius: 5px;
  }
  @keyframes up-right {
    0% {
      transform: scale(1);
      opacity: 0.25;
    }
    50% {
      transform: scale (1, 5);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.25;
    }
  }
  .enrolled {
    color: red;
    animation: up-right 1s infinite;
  }
</style>

<div class="box">
  <article class="media">
    <div class="medial-left">
      <div class="session-date">{data.daypart}</div>
      <div class="session-month">{data.monthpart}</div>
      <div class="session-time">{data.timepart}</div>
    </div>
    <div class="media-content">
      <div class="session-title">{data.title}</div>
      <div class="session-description">{data.description}</div>
      <div class="session-theme">{data.theme}</div>
      {#if role === 'user'}
        <div class="buttons">
          {#if data.isEnrolled}
            <button class="button is-danger is-inverted">
              <span class="icon enrolled"> <i class="fas fa-circle" /> </span>
              <span>Enrolled</span>
            </button>
          {:else}
            <button
              on:click={handleEnroll}
              type="button"
              class="button is-text">
              Enroll
            </button>
          {/if}
          {#if action_status === 3 && data.isEnrolled}
            <button
              on:click={() => joinSession(data)}
              type="button"
              class="button is-info is-inverted">
              <span class="icon"> <i class="fas fa-user-friends" /> </span>
              <span>Join Session</span>
            </button>
          {/if}
        </div>
        <div class="field" />
      {:else}
        <div class="buttons">
          <button
            on:click={handleEditSession}
            class="button is-primary is-active">
            <span class="icon"> <i class="far fa-edit" /> </span>
            <span>Edit</span>
          </button>
          {#if action_status === 1}
            <button
              type="button"
              on:click={handleStartSession}
              class="button is-link is-active">
              <span class="icon"> <i class="fas fa-play" /> </span>
              <span>Start</span>
            </button>
          {/if}
          {#if action_status === 3}
            <button
              type="button"
              on:click={handleStopSession}
              class="button is-link is-active">
              <span class="icon"> <i class="fas fa-stop-circle" /> </span>
              <span>Complete</span>
            </button>
          {/if}
          <button
            type="button"
            on:click={handleCancelSession}
            class="button is-warning is-active">
            <span class="icon"> <i class="fas fa-window-close" /> </span>
            <span>Cancel</span>
          </button>
          <button
            type="button"
            on:click={handleDeleteSession}
            class="button is-danger">
            <span class="icon"> <i class="fas fa-trash" /> </span>
            <span>Delete</span>
          </button>
          {#if !data.notification}
            <button
              type="button"
              class="button is-success"
              on:click={() => sendNotification(data)}>
              <span class="icon"> <i class="fas fa-paper-plane" /> </span>
              <span>Send Notification</span>
            </button>
          {/if}
          {#if data.meetingID}
            <button
              type="button"
              on:click={() => openSession(data)}
              class="button is-info">
              <span class="icon"> <i class="fas fa-user-friends" /> </span>
              <span>Open Session</span>
            </button>
          {/if}
        </div>
        <div class="field" />
      {/if}
    </div>
    {#if role === 'user'}
      <div class="media-right">
        {#if data.photoURL}
          <figure class="figure">
            <img src={data.photoURL} class="profile" alt />
          </figure>
        {:else}
          <figure class="image"><i class="fas fa-3x fa-user-circle" /></figure>
        {/if}
        <div class="presenter-details">{data.presenter}</div>
      </div>
    {/if}
  </article>
</div>
