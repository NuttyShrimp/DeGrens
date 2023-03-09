declare namespace Materials {
  type Config = {
    wirecutting: Wirecutting.Config;
    dumpsters: Dumpster.Config;
    radiotowers: Radiotowers.Config;
    recycleped: RecyclePed.Config;
    melting: Melting.Config;
    crafting: Crafting.Config;
    containers: Containers.Config;
  };

  type InitData = {
    wirecuttingLocations: Wirecutting.Config['locations'];
    radiotowerLocations: Radiotowers.Config['towers'];
    meltingZone: Melting.Config['zone'];
    moldZone: Containers.Config['mold']['location'];
    containerProps: Containers.Config['props'];
  };

  namespace Wirecutting {
    type Config = {
      cutTimeout: number;
      qualityDecrease: number;
      itemAmount: number;
      locations: Vec4[];
    };
  }

  namespace Dumpster {
    type Config = {
      loot: {
        item: string;
        amount: [number, number];
        chance: number;
      }[];
      refillTime: number;
    };
  }

  namespace Radiotowers {
    type Config = {
      timeout: number;
      amountOfItems: number;
      towers: Record<string, Radiotowers.Tower>;
    };

    type Tower = {
      position: Vec4;
      actions: { action: Action; position: Vec3 }[];
      peds: Vec3[];
      swarm: Vec3[];
    };

    type Action = 'disable' | 'overrideOne' | 'overrideTwo' | 'loot';

    type State = {
      pedsSpawned: boolean;
      disabled: boolean;
      overrideOne: boolean;
      overrideTwo: boolean;
      looted: boolean;
    };
  }

  namespace RecyclePed {
    type Config = {
      maximumPercentage: number;
      allowedItems: RecyclePed.Items;
    };

    type Items = Record<string, string[]>;
  }

  namespace Melting {
    type Config = {
      zone: {
        center: Vec3;
        heading: number;
        width: number;
        length: number;
        minZ: number;
        maxZ: number;
      };
      recipes: { from: RecipeItem; to: RecipeItem }[];
      meltingTime: number;
    };

    type RecipeItem = { name: string; amount: number };
  }

  namespace Crafting {
    type Config = {
      recipes: Record<string, Recipes.Config>;
      benches: Record<string, Bench.Config>;
    };

    namespace Recipes {
      type Config = { requiredReputation: number; items: { name: string; amount: number }[] };

      type Recipe = { requiredReputation: number; UIData: RecipeItem };

      // Required item data for inventory
      type RecipeItem = {
        name: string;
        label: string;
        image: string;
        size: Vec2;
        amount: number;
        requirements: { items: { name: string; label: string; amount: number }[] };
      };
    }

    namespace Bench {
      type Config = {
        items: string[];
        reputation?: ReputationType;
      };

      type Data = {
        id: string;
        items: string[];
      } & ({ reputation: ReputationType } | { level: number });
    }
  }

  namespace Containers {
    type Config = {
      mold: {
        location: Vec3;
        requiredSteel: number;
      };
      containers: Record<string, ContainerConfig>;
      props: Prop<string>[];
    };

    type ContainerConfig = {
      bench: string;
      position: Vec3;
      public: boolean;
    };

    type Container = {
      bench: string;
      position: Vec3;
    } & (
      | { public: true }
      | {
          public: false;
          keyItemId: string | null;
        }
    );

    type Prop<T extends string | number> = { model: T; doZOffset: boolean };
  }
}
