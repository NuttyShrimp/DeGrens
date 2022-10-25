declare namespace Bennys {
  namespace UI {
    namespace Components {
      interface Generic {
        name: string;
        // Which id is equipped (-1-indexed)
        equipped: number;
        // Name of the component for each id (e.g. "Front Wheel #1")
        componentNames: string[];
      }

      interface Wheels {
        equipped: {
          type: number;
          id: number;
        };
        categories: (Omit<Generic, 'name' | 'equipped'> & { id: number; label: string })[];
      }

      interface Color {
        name: keyof Upgrades.Cosmetic;
        equipped: RGB | number;
      }
    }

    interface GenericChange {
      name: keyof Upgrades.AllCosmeticModIds;
      data: number;
    }

    interface ColorChange {
      name: 'colors';
      data: Upgrades.Cosmetic;
    }

    interface WheelChange {
      name: 'wheels';
      data: Upgrades.Cosmetic['wheels'];
    }

    interface ExtraChange {
      name: string;
      data: {
        id: number;
        enabled: boolean;
      };
    }

    type Change = GenericChange | ColorChange | WheelChange | ExtraChange;
  }
}
