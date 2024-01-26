defmodule InstanceManager.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {InstanceManager.Manager, []}
    ]

    opts = [strategy: :one_for_one, name: InstanceManager.Supervisor]
    {:ok, super_pid} = Supervisor.start_link(children, opts)

    #
    instance_dir =
      System.fetch_env!("PAPER_INSTANCES_DIR")
      |> (&if(&1 |> String.starts_with?("/"),
            do: &1,
            else: throw("Env PAPER_INSTANCES_DIR must be an absolute path.")
          )).()

    InstanceManager.Manager.setup_existing_instances(instance_dir: instance_dir)

    {:ok, super_pid}
  end
end
