import { navLinks } from "../config/navLinks";

export function getPlaceholderRoutes() {
  return navLinks.flatMap(link => {
    const routes = [];

    if (!link.external) routes.push(link.to);

    link.children?.forEach(child => {
      if (!child.external) routes.push(child.to);
    });

    return routes;
  });
}
