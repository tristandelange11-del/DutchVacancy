/**
 * react-router-dom, but language-aware: every site-internal absolute path given
 * to Link, NavLink, Navigate or navigate() is sent to the same page in the
 * current language ("/jobs" becomes "/en/jobs" on the English site). Import
 * routing from here, not from react-router-dom, so no link loses the language.
 *
 * Plain .ts with createElement on purpose: no JSX means the fast-refresh lint
 * rule does not apply to this mixed components-and-hooks module.
 */
import { createElement, forwardRef, useCallback } from "react";
import * as RR from "react-router-dom";
import { useLang } from "@/lib/i18n";
import { localizePath } from "@/lib/paths";

export { Route, Routes, useLocation, useParams, useSearchParams } from "react-router-dom";

function useLocalize() {
  const { lang } = useLang();
  return useCallback(
    (to: RR.To): RR.To => {
      if (typeof to === "string") return localizePath(to, lang);
      return to.pathname ? { ...to, pathname: localizePath(to.pathname, lang) } : to;
    },
    [lang],
  );
}

export const Link = forwardRef<HTMLAnchorElement, RR.LinkProps>(function Link({ to, ...rest }, ref) {
  const localize = useLocalize();
  return createElement(RR.Link, { ...rest, ref, to: localize(to) });
});

export const NavLink = forwardRef<HTMLAnchorElement, RR.NavLinkProps>(function NavLink({ to, ...rest }, ref) {
  const localize = useLocalize();
  return createElement(RR.NavLink, { ...rest, ref, to: localize(to) });
});

export function Navigate(props: RR.NavigateProps) {
  const localize = useLocalize();
  return createElement(RR.Navigate, { ...props, to: localize(props.to) });
}

export function useNavigate() {
  const navigate = RR.useNavigate();
  const localize = useLocalize();
  return useCallback(
    (to: RR.To | number, options?: RR.NavigateOptions) => {
      if (typeof to === "number") return navigate(to);
      return navigate(localize(to), options);
    },
    [navigate, localize],
  );
}
