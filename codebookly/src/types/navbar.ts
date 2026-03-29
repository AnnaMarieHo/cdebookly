export type NavbarBrandConfig = {
  title: string;
  href: string;
};

export type NavbarBrowseOption = {
  kind: string;
  label: string;
  itemPlaceholder: string;
};

export type NavbarBrowseCopy = {
  regionAriaLabel: string;
  typeColumnLabel: string;
  contentTypeSelectAriaLabel: string;
};

export type NavbarBrowseConfig = {
  options: NavbarBrowseOption[];
  copy: NavbarBrowseCopy;
};

export type NavbarProps = {
  brand: NavbarBrandConfig;
  browse?: NavbarBrowseConfig;
  className?: string;
};
