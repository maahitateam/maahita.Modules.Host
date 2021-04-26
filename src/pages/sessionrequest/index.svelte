<script>
  import axios from "axios";
  import { onMount } from "svelte";
  import {
    apihost,
    appModules,
    getAuthHeaders,
    getDateParts,
    getFormattedDate,
  } from "../../config";

  import { sessionrequests, isAdmin, token } from "../../store";

  import TitleBar from "../components/title.svelte";
  import ProgressBar from "../components/progressbar.svelte";
  import Notify from "../components/notify.svelte";
  import UnAuthorizedView from "../components/unauthorized.svelte";

  $: notifyConfig = {
    cssClass: "is-info",
  };

  let module_config = {
    is_presenter_sessions_loading: false,
    is_loading: false,
    show_presenter_info: false,
    progres_bar_message: "",
    add_new_presenter: false,
    show_add_session: false,
    show_notification: false,
  };

  onMount(async () => {
    if ($isAdmin) {
      module_config.is_loading = true;
      const url = `${apihost}/${appModules.sessionrequest}`;
      const headers = getAuthHeaders($token);
      const result = await axios.get(url, headers).then((res) => res.data);
      result.forEach((d) => {
        d["scheduled"] = getFormattedDate(d, "scheduledon");
      });
      $sessionrequests = result;
      module_config.is_loading = false;
    }
  });

  const closenotify = () => (module_config["show_notification"] = false);

  const approvesession = async (session) => {
    try {
      const url = `${apihost}/${appModules.sessionrequest}/${session.id}`;
      const headers = getAuthHeaders($token);
      session.status = 200; //approve
      const result = await axios
        .put(url, session, headers)
        .then((res) => res.data);
      if (result) {
        $sessionrequests = $sessionrequests.filter(
          (ses) => ses.id !== session.id
        );
        notifyConfig["message"] = `${session.title} is approved`;
        module_config["show_notification"] = true;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const rejectsession = async (session) => {
    try {
      const url = `${apihost}/${appModules.sessionrequest}/${session.id}`;
      const headers = getAuthHeaders($token);
      session.status = 300; //approve
      const result = await axios
        .put(url, session, headers)
        .then((res) => res.data);
      if (result) {
        $sessionrequests = $sessionrequests.filter(
          (ses) => ses.id !== session.id
        );
        notifyConfig["message"] = `${session.title} is approved`;
        module_config["show_notification"] = true;
      }
    } catch (error) {
      console.log(error);
    }
  };
</script>

<style>
  .container {
    padding-top: 32px;
  }
  .title {
    font-size: 1.2rem;
    margin-bottom: 0px;
  }
  .media {
    margin-top: 0px;
    padding-top: 0px;
    justify-content: space-between;
    align-items: center;
  }
</style>

<div class="container">
  {#if $isAdmin}
    {#if module_config.is_loading}
      <ProgressBar module="session requests" />
    {:else}
      <TitleBar message="Session requests by various presenters" />
      {#if $sessionrequests.length > 0}
        <div class="box">
          {#each $sessionrequests as session}
            <article class="media">
              <div class="column title">{session.title}</div>
              <div class="column schedule">{session.scheduled}</div>
              <div class="column schedule">{session.description}</div>
              <div class="column presenter">{session.presenter}</div>
              <div class="column buttons">
                <button
                  class="button is-primary"
                  on:click={() => approvesession(session)}>
                  Approve
                </button>
                <button
                  class="button is-danger"
                  on:click={() => rejectsession(session)}>
                  Reject
                </button>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="box">
          <TitleBar message="create sessions to spread the knowledge" />
        </div>
      {/if}
    {/if}
  {:else}
    <div>
      <UnAuthorizedView message="You are not authorized to view the content" />
    </div>
  {/if}
  {#if module_config.show_notification}
    <Notify on:closenotify={closenotify} config={notifyConfig} />
  {/if}
</div>
