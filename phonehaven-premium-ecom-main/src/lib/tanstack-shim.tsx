// Compatibility shim so route/component files written for @tanstack/react-router
// keep working on top of react-router-dom v6 with zero UI changes.
import * as React from "react";
import {
  Link as RRLink,
  NavLink as RRNavLink,
  useNavigate as useRRNavigate,
  useParams as useRRParams,
} from "react-router-dom";

type AnyProps = Record<string, any>;

function fillParams(to: string, params?: Record<string, string>) {
  if (!params) return to;
  return to.replace(/\$([A-Za-z0-9_]+)/g, (_, key) => encodeURIComponent(params[key] ?? ""));
}

/** Serialises TanStack-style `search` (object or string) into a query string. */
function withSearch(to: string, search?: any) {
  if (!search) return to;
  let qs = "";
  if (typeof search === "string") qs = search.replace(/^\?/, "");
  else if (typeof search === "object") {
    const params = new URLSearchParams();
    Object.entries(search).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
    qs = params.toString();
  }
  return qs ? `${to}${to.includes("?") ? "&" : "?"}${qs}` : to;
}

export const Link = React.forwardRef<HTMLAnchorElement, AnyProps>(function Link(
  { to, params, search, hash, activeProps, inactiveProps, activeOptions, preload, resetScroll, from, ...rest },
  ref,
) {
  const href = typeof to === "string" ? withSearch(fillParams(to, params), search) : to;
  if (activeProps || inactiveProps) {
    return (
      <RRNavLink
        ref={ref as any}
        to={href}
        end={activeOptions?.exact}
        className={(state) => {
          const base = rest.className;
          const extra = state.isActive ? activeProps?.className : inactiveProps?.className;
          return [base, extra].filter(Boolean).join(" ");
        }}
        {...Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "className"))}
      />
    );
  }
  return <RRLink ref={ref as any} to={href} {...rest} />;
});

export function useNavigate(_opts?: any) {
  const nav = useRRNavigate();
  return (opts: any) => {
    if (typeof opts === "string") return nav(opts);
    if (!opts) return;
    if (opts.to === "..") return nav(-1 as any);
    let to = opts.to as string;
    to = withSearch(fillParams(to, opts.params), opts.search);
    return nav(to, { replace: opts.replace });
  };
}

export function useParams<T = Record<string, string>>(): T {
  return useRRParams() as unknown as T;
}

export function notFound() {
  const err: any = new Error("Not Found");
  err.__notFound = true;
  return err;
}

// Route registry so route file's default export can be consumed by App.tsx
export type RouteObject = {
  path: string;
  options: any;
  Component: React.ComponentType;
  useLoaderData: () => any;
};

function applyHead(head: any) {
  if (!head) return;
  const title = head.meta?.find?.((m: any) => m?.title)?.title;
  if (title) document.title = title;
  head.meta?.forEach?.((m: any) => {
    if (!m) return;
    if (m.name === "description" && m.content) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "description");
        document.head.appendChild(el);
      }
      el.setAttribute("content", m.content);
    }
    if (m.property && m.content) {
      let el = document.querySelector(`meta[property="${m.property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", m.property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", m.content);
    }
  });
  head.links?.forEach?.((l: any) => {
    if (l?.rel === "canonical" && l.href) {
      let el = document.querySelector('link[rel="canonical"]');
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute("href", l.href);
    }
  });
}

export function createFileRoute(path: string) {
  return (opts: any): RouteObject => {
    const route: RouteObject = {
      path,
      options: opts,
      Component: () => null as any,
      useLoaderData: () => (route as any)._loaderData,
    };
    route.Component = function RouteComponent() {
      const params = useRRParams();
      let loaderData: any;
      let notFoundHit = false;
      if (opts.loader) {
        try {
          loaderData = opts.loader({ params });
        } catch (e: any) {
          if (e && e.__notFound) notFoundHit = true;
          else throw e;
        }
      }
      (route as any)._loaderData = loaderData;
      React.useEffect(() => {
        if (opts.head) {
          try {
            applyHead(opts.head({ loaderData }));
          } catch {
            /* noop */
          }
        }
      }, [JSON.stringify(params)]);
      if (notFoundHit) {
        const NF = opts.notFoundComponent;
        return NF ? <NF /> : <div className="p-10 text-center">Not found</div>;
      }
      const C = opts.component;
      return C ? <C /> : null;
    };
    return route;
  };
}

// Unused stubs kept for import compatibility
export const Outlet: React.FC = () => null;
export const HeadContent: React.FC = () => null;
export const Scripts: React.FC = () => null;
export function createRootRouteWithContext<T>() {
  return (_opts: any) => ({}) as any;
}
export function useRouter() {
  const nav = useRRNavigate();
  return { invalidate: () => {}, navigate: (o: any) => nav(typeof o === "string" ? o : o.to) };
}
