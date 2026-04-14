(()=>{var a={};a.id=1405,a.ids=[1405],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31370:(a,b,c)=>{"use strict";c.d(b,{Df:()=>h,TE:()=>j,yQ:()=>i});var d=c(30747);let e=process.env.GOOGLE_GEMINI_API_KEY||"DUMMY_KEY";process.env.GOOGLE_GEMINI_API_KEY;let f=new d.ij(e),g=f.getGenerativeModel({model:"gemini-2.5-flash",generationConfig:{temperature:.7,topP:.95,topK:40,maxOutputTokens:8192}});async function h(a){try{return(await g.generateContent(a)).response.text()}catch(a){throw console.error("Error generating text with Gemini:",a),a}}async function i(a){try{let b=(await g.generateContent(a+"\n\nRespond ONLY with valid JSON, no markdown formatting.")).response.text().replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(b)}catch(a){throw console.error("Error generating JSON with Gemini:",a),a}}async function j(a){try{let b=g.startChat({history:a.slice(0,-1).map(a=>({role:"user"===a.role?"user":"model",parts:[{text:a.content}]}))}),c=a[a.length-1];return(await b.sendMessage(c.content)).response.text()}catch(a){throw console.error("Error in chat with Gemini:",a),a}}f.getGenerativeModel({model:"gemini-1.5-flash",generationConfig:{temperature:.9,topP:1,topK:32,maxOutputTokens:4096}})},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},49764:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>E,patchFetch:()=>D,routeModule:()=>z,serverHooks:()=>C,workAsyncStorage:()=>A,workUnitAsyncStorage:()=>B});var d={};c.r(d),c.d(d,{POST:()=>y});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(24235),k=c(261),l=c(54365),m=c(90771),n=c(73461),o=c(67798),p=c(92280),q=c(62018),r=c(45696),s=c(47929),t=c(86439),u=c(37527),v=c(45592),w=c(31370),x=c(75002);async function y(a){try{let{messages:b,project_context:c}=await a.json();if(!b||!Array.isArray(b))return v.NextResponse.json({error:"Messages array is required"},{status:400});let d=(0,x.fn)(x.Fz,{project_context:c||"Nuevo proyecto sin informaci\xf3n previa"}),e=[{role:"system",content:d},...b],f=await (0,w.TE)(e);return v.NextResponse.json({response:f})}catch(a){return console.error("Error in chat:",a),v.NextResponse.json({error:"Failed to process chat message"},{status:500})}}let z=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/quotation/chat/route",pathname:"/api/quotation/chat",filename:"route",bundlePath:"app/api/quotation/chat/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\SONY\\Desktop\\kimi\\alma-verde-platform\\src\\app\\api\\quotation\\chat\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:A,workUnitAsyncStorage:B,serverHooks:C}=z;function D(){return(0,g.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:B})}async function E(a,b,c){z.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/quotation/chat/route";"/index"===d&&(d="/");let e=await z.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:v,nextConfig:w,parsedUrl:x,isDraftMode:y,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:E,clientReferenceManifest:F,serverActionsManifest:G}=e,H=(0,k.normalizeAppPath)(d),I=!!(A.dynamicRoutes[H]||A.routes[E]),J=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,x,!1):b.end("This page could not be found"),null);if(I&&!y){let a=!!A.routes[E],b=A.dynamicRoutes[H];if(b&&!1===b.fallback&&!a){if(w.experimental.adapterPath)return await J();throw new t.NoFallbackError}}let K=null;!I||z.isDev||y||(K="/index"===(K=E)?"/":K);let L=!0===z.isDev||!I,M=I&&!L;G&&F&&(0,j.setManifestsSingleton)({page:d,clientReferenceManifest:F,serverActionsManifest:G});let N=a.method||"GET",O=(0,i.getTracer)(),P=O.getActiveScopeSpan(),Q={params:v,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:L,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>z.onRequestError(a,b,d,e,B)},sharedContext:{buildId:g}},R=new l.NodeNextRequest(a),S=new l.NodeNextResponse(b),T=m.NextRequestAdapter.fromNodeNextRequest(R,(0,m.signalFromNodeResponse)(b));try{let e=async a=>z.handle(T,Q).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=O.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==n.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${N} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${N} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=Q.renderOpts.fetchMetrics;let i=Q.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=Q.renderOpts.collectedTags;if(!I)return await (0,p.I)(R,S,d,Q.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,q.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[s.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==Q.renderOpts.collectedRevalidate&&!(Q.renderOpts.collectedRevalidate>=s.INFINITE_CACHE)&&Q.renderOpts.collectedRevalidate,e=void 0===Q.renderOpts.collectedExpire||Q.renderOpts.collectedExpire>=s.INFINITE_CACHE?void 0:Q.renderOpts.collectedExpire;return{value:{kind:u.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await z.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,o.c)({isStaticGeneration:M,isOnDemandRevalidate:C})},!1,B),b}},l=await z.handleResponse({req:a,nextConfig:w,cacheKey:K,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!I)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==u.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,q.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&I||m.delete(s.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,r.getCacheControlHeader)(l.cacheControl)),await (0,p.I)(R,S,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};P?await j(P):await O.withPropagatedContext(a.headers,()=>O.trace(n.BaseServerSpan.handleRequest,{spanName:`${N} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":N,"http.target":a.url}},j))}catch(b){if(b instanceof t.NoFallbackError||await z.onRequestError(a,b,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,o.c)({isStaticGeneration:M,isOnDemandRevalidate:C})},!1,B),I)throw b;return await (0,p.I)(R,S,new Response(null,{status:500})),null}}},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},75002:(a,b,c)=>{"use strict";c.d(b,{Fk:()=>e,Fz:()=>f,YY:()=>d,fn:()=>g});let d=`Genera una descripci\xf3n detallada para crear un render 3D fotorrealista del siguiente proyecto:

TIPO DE PROYECTO: {project_type}
DESCRIPCI\xd3N: {description}
ESTILO: {style}
MATERIALES: {materials}
DIMENSIONES: {dimensions}

Crea una descripci\xf3n visual detallada que incluya:
1. Composici\xf3n general del espacio
2. Paleta de colores espec\xedfica
3. Iluminaci\xf3n y atm\xf3sfera
4. Texturas y materiales
5. Elementos decorativos o funcionales clave
6. Perspectiva y \xe1ngulo de c\xe1mara sugerido

La descripci\xf3n debe ser lo suficientemente detallada para que un artista 3D pueda crear un render fotorrealista.

Responde en espa\xf1ol, con una descripci\xf3n de 150-250 palabras.`,e=`Eres un experto en cotizaci\xf3n de proyectos de dise\xf1o y producci\xf3n en Colombia.

Calcula una cotizaci\xf3n detallada bas\xe1ndote en las siguientes variables:

VARIABLES DEL PROYECTO:
{variables}

TARIFAS BASE (COP):
- Stand b\xe1sico: $2,000,000 por m\xb2 + materiales
- Evento corporativo: $5,000,000 - $15,000,000 base + servicios
- Branding f\xedsico: $3,000,000 - $8,000,000 seg\xfan complejidad
- Decoraci\xf3n: $1,500,000 por m\xb2 + mobiliario
- Mobiliario: Seg\xfan piezas y materiales
- Alquiler: 30% del valor de compra por evento

COSTOS ADICIONALES:
- Transporte: $200,000 - $1,000,000 seg\xfan distancia
- Instalaci\xf3n: $500,000 - $2,000,000 seg\xfan complejidad
- Desmontaje: $300,000 - $1,000,000

Genera una cotizaci\xf3n que incluya:
1. Costo base (dise\xf1o + producci\xf3n)
2. Materiales
3. Transporte (si aplica)
4. Instalaci\xf3n (si aplica)
5. Desmontaje (si aplica)
6. Subtotal
7. IVA (19%)
8. Total

Responde con un objeto JSON que contenga:
{
  "base_cost": number,
  "materials_cost": number,
  "transport_cost": number,
  "installation_cost": number,
  "disassembly_cost": number,
  "subtotal": number,
  "tax": number,
  "total": number,
  "breakdown": {
    "design": number,
    "production": number,
    "materials": [{ "item": string, "cost": number }]
  },
  "notes": string[]
}

S\xe9 realista con los precios del mercado colombiano.`,f=`Eres un asistente virtual de Alma Verde, una agencia de dise\xf1o y producci\xf3n especializada en:
- Stands para ferias y eventos
- Eventos corporativos
- Branding f\xedsico
- Decoraci\xf3n de espacios (residencial y comercial)
- Mobiliario personalizado
- Alquiler de equipos

Tu objetivo es ayudar al cliente a definir su proyecto de manera conversacional y amigable.

INSTRUCCIONES:
1. S\xe9 amable, profesional y entusiasta
2. Haz preguntas espec\xedficas para entender mejor el proyecto
3. Sugiere ideas y opciones cuando sea apropiado
4. Mant\xe9n las respuestas concisas (2-3 p\xe1rrafos m\xe1ximo)
5. Si el cliente menciona presupuesto, s\xe9 realista sobre lo que se puede lograr
6. Usa emojis ocasionalmente para ser m\xe1s cercano

INFORMACI\xd3N DEL PROYECTO ACTUAL:
{project_context}

Responde de manera conversacional y \xfatil.`;function g(a,b){let c=a;for(let[a,d]of Object.entries(b)){let b=`{${a}}`,e="object"==typeof d?JSON.stringify(d,null,2):String(d);c=c.replace(RegExp(b,"g"),e)}return c}},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[3445,1813,747],()=>b(b.s=49764));module.exports=c})();