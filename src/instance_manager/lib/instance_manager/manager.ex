defmodule InstanceManager.Manager do
  use DynamicSupervisor

  @required_instance_files ["eula.txt"]

  def start_link(init_arg) do
    DynamicSupervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  def setup_existing_instances(opts) when opts |> is_list do
    existing_instances = find_instances(opts) |> IO.inspect()
  end

  #

  @impl true
  def init(_init_arg) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  #

  defp find_instances(instance_dir: instance_dir) do
    Path.wildcard(instance_dir <> "/*")
    |> Enum.reject(fn path ->
      {:ok, entry} = File.lstat(path)

      entry.type != :directory
    end)
    |> Enum.reject(fn maybe_instance_dir ->
      not is_instance_directory?(maybe_instance_dir)
    end)
  end

  defp is_instance_directory?(path) do
    dir_contents =
      Path.wildcard(path <> "/*")
      |> Enum.map(&Path.basename(&1))

    # Are all required files present in the provided directory?
    @required_instance_files
    |> Enum.map(fn required_file ->
      dir_contents
      |> Enum.any?(&(required_file == &1))
    end)
    |> Enum.all?(&(&1 == true))
  end
end
