defmodule InstanceManager.Instance do
  use GenServer

  alias InstanceManager.Structs.Instance, as: InstanceStruct

  @initial_instance_state %InstanceStruct{
    name: "0",
    running: true,
    terrain_ready: false
  }

  def start_link(init_arg) do
    GenServer.start_link(__MODULE__, init_arg)
  end

  def start(pid) do
    GenServer.call(pid, :start)
  end

  def stop(pid) do
    GenServer.call(pid, :stop)
  end

  def name_of(pid) do
    GenServer.call(pid, :name_of)
  end

  # Server

  @impl true
  def init(_init_arg) do
    {:ok, %{}}
  end

  @impl true
  def handle_call(:start, _from, _state) do
    java = System.find_executable("java")
    server = Port.open({:spawn_executable, java}, [:binary, args: ["--version"]])

    {:reply, :ok, {server, @initial_instance_state}}
  end

  @impl true
  def handle_call(:name_of, _from, state) do
    %InstanceStruct{name: name} = state
    {:reply, {:ok, name}, state}
  end

  @impl true
  def handle_info({_server, {:data, log_output}}, state) do
    # TODO: notify webui
    log_output
    |> IO.puts()

    {:noreply, state}
  end
end
