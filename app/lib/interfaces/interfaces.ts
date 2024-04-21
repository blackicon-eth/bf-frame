export interface Attributes {
  trait_type: string;
  value: boolean;
}

export interface NftJsonInterface {
  description: string;
  image: string;
  name: string;
  attributes: Attributes;
}
