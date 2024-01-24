defmodule InstanceManagerTest do
  use ExUnit.Case
  doctest InstanceManager

  test "greets the world" do
    assert InstanceManager.hello() == :world
  end
end
