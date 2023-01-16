declare namespace Bennys {
  type Menu = 'main' | 'repair' | SelectableMenu;

  type SelectableMenu = 'colors' | 'interior' | 'exterior' | 'wheels' | 'extras' | 'cart';

  interface Guide {
    title: string;
    kbdCombo: string[];
  }

  interface TitleBars {
    title: string;
    price: number;
    equipped: boolean;
    guides: Guide[];
    isInCart: boolean;
  }

  interface State {
    currentCost: number;
    currentMenu: Menu;
    bars: TitleBars;
    cart: Cart[];
    prices: Record<string, number>;
  }

  interface StateActions {
    setCost: (price: number) => void;
    setMenu: (menu: Menu) => void;
    setPrices: (prices: Record<string, number>) => void;
    resetStore: () => void;

    // useInformationbar replace
    setBarTitle: (title: string) => void;
    resetTitleBar: () => void;
    setEquipped: (equipped: boolean) => void;
    setInCart: (isInCart: boolean) => void;
    setBarPrice: (price: number) => void;

    // useCart replace
    getPriceOfComp: (comp: string) => number;
    getCartItemForComp: (comp: string) => Cart | undefined;
    addToCart: (comp: string, data: any) => void;
    removeFromCart: (comp: string) => void;

    addGuides: (guides: Guide[]) => void;
    removeGuides: (guides: Guide[]) => void;
  }

  interface ControllerComponent<T> {
    value: T;
    onChange: (newValue: T) => void;
    // Function called when a specific part is equipped.
    // Will usually be the handler for adding items to the cart.
    onSelect: (newValue: T) => void;

    selected?: boolean;
  }

  namespace CategorySlider {
    interface Props extends Omit<ControllerComponent<number>, 'onSelect' | 'selected'> {
      options: string[];
    }
  }

  namespace IdSelector {
    interface Props extends ControllerComponent<number> {
      max: number;
    }
  }

  namespace ColorSelector {
    type Props = Required<Omit<ControllerComponent<RGB>, 'onSelect', 'onChange'>> & {
      onChange: (type: Type, newValue: RGB) => void;
      onSelect: (type: Type, newValue: RGB) => void;
      category: string;
    };

    interface AbstractProps extends Props {
      options: (string | RGB)[];
      rows: number;
      type: Type;
    }

    type Type = 'gta' | 'custom';
  }

  namespace RGBSliders {
    interface HSVColor {
      h: number;
      s: number;
      v: number;
    }

    interface HSLColor {
      h: number;
      s: number;
      l: number;
    }

    interface SliderProps {
      active: boolean;
      left: number;
      currentColor: string;
      sliderColor: string;
      onChange: (newValue: number) => void;
    }
  }

  namespace Components {
    interface Generic {
      name: string;
      // Which id is equipped (-1-indexed)
      equipped: number;
      // Name of the part for each id (e.g. "Front Wheel #1")
      componentNames: string[];
    }

    interface Wheels {
      equipped: {
        type: number;
        id: number;
      };
      categories: (Omit<Generic, 'name' | 'equipped'> & { id: number; label: string })[];
    }

    type Color = Pick<Generic, 'name'> & { equipped: RGB | number };

    interface Extra {
      id: number;
      enabled: boolean;
    }

    type Any = Generic | Wheels;
  }

  interface Cart {
    component: string;
    data: any;
  }
}
