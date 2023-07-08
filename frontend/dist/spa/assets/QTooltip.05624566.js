import{h as q,k as B,c as y,l as Z,g as P,r as E,x as dt,o as X,n as H,u as ft,G as Q,v as Y,ap as vt,aq as He,ar as mt,as as ht,_ as Ce,E as Pe,p as gt,at as bt,J as Oe,au as re,w as C,av as Te,aw as yt,ax as ue,a as wt,C as pt,ay as xt,az as kt,aA as qt,H as ze,aB as Fe,U as Le,aC as Tt,L as _e,W as Et}from"./index.476dfc87.js";const St=q("div",{class:"q-space"});var jt=B({name:"QSpace",setup(){return()=>St}});const me={dark:{type:Boolean,default:null}};function he(e,t){return y(()=>e.dark===null?t.dark.isActive:e.dark)}var Nt=B({name:"QBar",props:{...me,dense:Boolean},setup(e,{slots:t}){const{proxy:{$q:o}}=P(),n=he(e,o),i=y(()=>`q-bar row no-wrap items-center q-bar--${e.dense===!0?"dense":"standard"}  q-bar--${n.value===!0?"dark":"light"}`);return()=>q("div",{class:i.value,role:"toolbar"},Z(t.default))}});function Ct(){const e=E(!dt.value);return e.value===!1&&X(()=>{e.value=!0}),e}const Qe=typeof ResizeObserver!="undefined",Be=Qe===!0?{}:{style:"display:block;position:absolute;top:0;left:0;right:0;bottom:0;height:100%;width:100%;overflow:hidden;pointer-events:none;z-index:-1;",url:"about:blank"};var Kt=B({name:"QResizeObserver",props:{debounce:{type:[String,Number],default:100}},emits:["resize"],setup(e,{emit:t}){let o=null,n,i={width:-1,height:-1};function d(a){a===!0||e.debounce===0||e.debounce==="0"?l():o===null&&(o=setTimeout(l,e.debounce))}function l(){if(o!==null&&(clearTimeout(o),o=null),n){const{offsetWidth:a,offsetHeight:r}=n;(a!==i.width||r!==i.height)&&(i={width:a,height:r},t("resize",i))}}const{proxy:u}=P();if(Qe===!0){let a;const r=c=>{n=u.$el.parentNode,n?(a=new ResizeObserver(d),a.observe(n),l()):c!==!0&&Q(()=>{r(!0)})};return X(()=>{r()}),H(()=>{o!==null&&clearTimeout(o),a!==void 0&&(a.disconnect!==void 0?a.disconnect():n&&a.unobserve(n))}),ft}else{let c=function(){o!==null&&(clearTimeout(o),o=null),r!==void 0&&(r.removeEventListener!==void 0&&r.removeEventListener("resize",d,Y.passive),r=void 0)},h=function(){c(),n&&n.contentDocument&&(r=n.contentDocument.defaultView,r.addEventListener("resize",d,Y.passive),l())};const a=Ct();let r;return X(()=>{Q(()=>{n=u.$el,n&&h()})}),H(c),u.trigger=d,()=>{if(a.value===!0)return q("object",{style:Be.style,tabindex:-1,type:"text/html",data:Be.url,"aria-hidden":"true",onLoad:h})}}}});const Pt=[null,document,document.body,document.scrollingElement,document.documentElement];function Ve(e,t){let o=vt(t);if(o===void 0){if(e==null)return window;o=e.closest(".scroll,.scroll-y,.overflow-auto")}return Pt.includes(o)?window:o}function It(e){return e===window?window.pageYOffset||window.scrollY||document.body.scrollTop||0:e.scrollTop}function Ut(e){return e===window?window.pageXOffset||window.scrollX||document.body.scrollLeft||0:e.scrollLeft}let le;function Lt(){if(le!==void 0)return le;const e=document.createElement("p"),t=document.createElement("div");He(e,{width:"100%",height:"200px"}),He(t,{position:"absolute",top:"0px",left:"0px",visibility:"hidden",width:"200px",height:"150px",overflow:"hidden"}),t.appendChild(e),document.body.appendChild(t);const o=e.offsetWidth;t.style.overflow="scroll";let n=e.offsetWidth;return o===n&&(n=t.clientWidth),t.remove(),le=o-n,le}function Gt(e,t=!0){return!e||e.nodeType!==Node.ELEMENT_NODE?!1:t?e.scrollHeight>e.clientHeight&&(e.classList.contains("scroll")||e.classList.contains("overflow-auto")||["auto","scroll"].includes(window.getComputedStyle(e)["overflow-y"])):e.scrollWidth>e.clientWidth&&(e.classList.contains("scroll")||e.classList.contains("overflow-auto")||["auto","scroll"].includes(window.getComputedStyle(e)["overflow-x"]))}let ke,ae=0;const p=new Array(256);for(let e=0;e<256;e++)p[e]=(e+256).toString(16).substring(1);const Ht=(()=>{const e=typeof crypto!="undefined"?crypto:typeof window!="undefined"?window.crypto||window.msCrypto:void 0;if(e!==void 0){if(e.randomBytes!==void 0)return e.randomBytes;if(e.getRandomValues!==void 0)return t=>{const o=new Uint8Array(t);return e.getRandomValues(o),o}}return t=>{const o=[];for(let n=t;n>0;n--)o.push(Math.floor(Math.random()*256));return o}})(),$e=4096;function Xt(){(ke===void 0||ae+16>$e)&&(ae=0,ke=Ht($e));const e=Array.prototype.slice.call(ke,ae,ae+=16);return e[6]=e[6]&15|64,e[8]=e[8]&63|128,p[e[0]]+p[e[1]]+p[e[2]]+p[e[3]]+"-"+p[e[4]]+p[e[5]]+"-"+p[e[6]]+p[e[7]]+"-"+p[e[8]]+p[e[9]]+"-"+p[e[10]]+p[e[11]]+p[e[12]]+p[e[13]]+p[e[14]]+p[e[15]]}let W=[],J=[];function je(e){J=J.filter(t=>t!==e)}function Ot(e){je(e),J.push(e)}function Me(e){je(e),J.length===0&&W.length>0&&(W[W.length-1](),W=[])}function Bt(e){J.length===0?e():W.push(e)}function Yt(e){W=W.filter(t=>t!==e)}var Jt=B({name:"QItem",props:{...me,...mt,tag:{type:String,default:"div"},active:{type:Boolean,default:null},clickable:Boolean,dense:Boolean,insetLevel:Number,tabindex:[String,Number],focused:Boolean,manualFocus:Boolean},emits:["click","keyup"],setup(e,{slots:t,emit:o}){const{proxy:{$q:n}}=P(),i=he(e,n),{hasLink:d,linkAttrs:l,linkClass:u,linkTag:a,navigateOnClick:r}=ht(),c=E(null),h=E(null),g=y(()=>e.clickable===!0||d.value===!0||e.tag==="label"),s=y(()=>e.disable!==!0&&g.value===!0),w=y(()=>"q-item q-item-type row no-wrap"+(e.dense===!0?" q-item--dense":"")+(i.value===!0?" q-item--dark":"")+(d.value===!0&&e.active===null?u.value:e.active===!0?` q-item--active${e.activeClass!==void 0?` ${e.activeClass}`:""}`:"")+(e.disable===!0?" disabled":"")+(s.value===!0?" q-item--clickable q-link cursor-pointer "+(e.manualFocus===!0?"q-manual-focusable":"q-focusable q-hoverable")+(e.focused===!0?" q-manual-focusable--focused":""):"")),T=y(()=>{if(e.insetLevel===void 0)return null;const m=n.lang.rtl===!0?"Right":"Left";return{["padding"+m]:16+e.insetLevel*56+"px"}});function O(m){s.value===!0&&(h.value!==null&&(m.qKeyEvent!==!0&&document.activeElement===c.value?h.value.focus():document.activeElement===h.value&&c.value.focus()),r(m))}function L(m){if(s.value===!0&&Ce(m,13)===!0){Pe(m),m.qKeyEvent=!0;const $=new MouseEvent("click",m);$.qKeyEvent=!0,c.value.dispatchEvent($)}o("keyup",m)}function v(){const m=gt(t.default,[]);return s.value===!0&&m.unshift(q("div",{class:"q-focus-helper",tabindex:-1,ref:h})),m}return()=>{const m={ref:c,class:w.value,style:T.value,role:"listitem",onClick:O,onKeyup:L};return s.value===!0?(m.tabindex=e.tabindex||"0",Object.assign(m,l.value)):g.value===!0&&(m["aria-disabled"]="true"),q(a.value,m,v())}}}),Zt=B({name:"QItemSection",props:{avatar:Boolean,thumbnail:Boolean,side:Boolean,top:Boolean,noWrap:Boolean},setup(e,{slots:t}){const o=y(()=>`q-item__section column q-item__section--${e.avatar===!0||e.side===!0||e.thumbnail===!0?"side":"main"}`+(e.top===!0?" q-item__section--top justify-start":" justify-center")+(e.avatar===!0?" q-item__section--avatar":"")+(e.thumbnail===!0?" q-item__section--thumbnail":"")+(e.noWrap===!0?" q-item__section--nowrap":""));return()=>q("div",{class:o.value},Z(t.default))}});function Ee(){if(window.getSelection!==void 0){const e=window.getSelection();e.empty!==void 0?e.empty():e.removeAllRanges!==void 0&&(e.removeAllRanges(),bt.is.mobile!==!0&&e.addRange(document.createRange()))}else document.selection!==void 0&&document.selection.empty()}const Ne={target:{default:!0},noParentEvent:Boolean,contextMenu:Boolean};function Ke({showing:e,avoidEmit:t,configureAnchorEl:o}){const{props:n,proxy:i,emit:d}=P(),l=E(null);let u=null;function a(s){return l.value===null?!1:s===void 0||s.touches===void 0||s.touches.length<=1}const r={};o===void 0&&(Object.assign(r,{hide(s){i.hide(s)},toggle(s){i.toggle(s),s.qAnchorHandled=!0},toggleKey(s){Ce(s,13)===!0&&r.toggle(s)},contextClick(s){i.hide(s),Oe(s),Q(()=>{i.show(s),s.qAnchorHandled=!0})},prevent:Oe,mobileTouch(s){if(r.mobileCleanup(s),a(s)!==!0)return;i.hide(s),l.value.classList.add("non-selectable");const w=s.target;re(r,"anchor",[[w,"touchmove","mobileCleanup","passive"],[w,"touchend","mobileCleanup","passive"],[w,"touchcancel","mobileCleanup","passive"],[l.value,"contextmenu","prevent","notPassive"]]),u=setTimeout(()=>{u=null,i.show(s),s.qAnchorHandled=!0},300)},mobileCleanup(s){l.value.classList.remove("non-selectable"),u!==null&&(clearTimeout(u),u=null),e.value===!0&&s!==void 0&&Ee()}}),o=function(s=n.contextMenu){if(n.noParentEvent===!0||l.value===null)return;let w;s===!0?i.$q.platform.is.mobile===!0?w=[[l.value,"touchstart","mobileTouch","passive"]]:w=[[l.value,"mousedown","hide","passive"],[l.value,"contextmenu","contextClick","notPassive"]]:w=[[l.value,"click","toggle","passive"],[l.value,"keyup","toggleKey","passive"]],re(r,"anchor",w)});function c(){Te(r,"anchor")}function h(s){for(l.value=s;l.value.classList.contains("q-anchor--skip");)l.value=l.value.parentNode;o()}function g(){if(n.target===!1||n.target===""||i.$el.parentNode===null)l.value=null;else if(n.target===!0)h(i.$el.parentNode);else{let s=n.target;if(typeof n.target=="string")try{s=document.querySelector(n.target)}catch{s=void 0}s!=null?(l.value=s.$el||s,o()):(l.value=null,console.error(`Anchor: target "${n.target}" not found`))}}return C(()=>n.contextMenu,s=>{l.value!==null&&(c(),o(s))}),C(()=>n.target,()=>{l.value!==null&&c(),g()}),C(()=>n.noParentEvent,s=>{l.value!==null&&(s===!0?c():o())}),X(()=>{g(),t!==!0&&n.modelValue===!0&&l.value===null&&d("update:modelValue",!1)}),H(()=>{u!==null&&clearTimeout(u),c()}),{anchorEl:l,canShow:a,anchorEvents:r}}function Ie(e,t){const o=E(null);let n;function i(u,a){const r=`${a!==void 0?"add":"remove"}EventListener`,c=a!==void 0?a:n;u!==window&&u[r]("scroll",c,Y.passive),window[r]("scroll",c,Y.passive),n=a}function d(){o.value!==null&&(i(o.value),o.value=null)}const l=C(()=>e.noParentEvent,()=>{o.value!==null&&(d(),t())});return H(l),{localScrollTarget:o,unconfigureScrollTarget:d,changeScrollEvent:i}}const Ue={modelValue:{type:Boolean,default:null},"onUpdate:modelValue":[Function,Array]},Ge=["beforeShow","show","beforeHide","hide"];function Xe({showing:e,canShow:t,hideOnRouteChange:o,handleShow:n,handleHide:i,processOnMount:d}){const l=P(),{props:u,emit:a,proxy:r}=l;let c;function h(v){e.value===!0?w(v):g(v)}function g(v){if(u.disable===!0||v!==void 0&&v.qAnchorHandled===!0||t!==void 0&&t(v)!==!0)return;const m=u["onUpdate:modelValue"]!==void 0;m===!0&&(a("update:modelValue",!0),c=v,Q(()=>{c===v&&(c=void 0)})),(u.modelValue===null||m===!1)&&s(v)}function s(v){e.value!==!0&&(e.value=!0,a("beforeShow",v),n!==void 0?n(v):a("show",v))}function w(v){if(u.disable===!0)return;const m=u["onUpdate:modelValue"]!==void 0;m===!0&&(a("update:modelValue",!1),c=v,Q(()=>{c===v&&(c=void 0)})),(u.modelValue===null||m===!1)&&T(v)}function T(v){e.value!==!1&&(e.value=!1,a("beforeHide",v),i!==void 0?i(v):a("hide",v))}function O(v){u.disable===!0&&v===!0?u["onUpdate:modelValue"]!==void 0&&a("update:modelValue",!1):v===!0!==e.value&&(v===!0?s:T)(c)}C(()=>u.modelValue,O),o!==void 0&&yt(l)===!0&&C(()=>r.$route.fullPath,()=>{o.value===!0&&e.value===!0&&w()}),d===!0&&X(()=>{O(u.modelValue)});const L={show:g,hide:w,toggle:h};return Object.assign(r,L),L}const _=[];function en(e){return _.find(t=>t.contentEl!==null&&t.contentEl.contains(e))}function Ye(e,t){do{if(e.$options.name==="QMenu"){if(e.hide(t),e.$props.separateClosePopup===!0)return ue(e)}else if(e.__qPortal===!0){const o=ue(e);return o!==void 0&&o.$options.name==="QPopupProxy"?(e.hide(t),o):e}e=ue(e)}while(e!=null)}function tn(e,t,o){for(;o!==0&&e!==void 0&&e!==null;){if(e.__qPortal===!0){if(o--,e.$options.name==="QMenu"){e=Ye(e,t);continue}e.hide(t)}e=ue(e)}}function $t(e){for(e=e.parent;e!=null;){if(e.type.name==="QGlobalDialog")return!0;if(e.type.name==="QDialog"||e.type.name==="QMenu")return!1;e=e.parent}return!1}function Je(e,t,o,n){const i=E(!1),d=E(!1);let l=null;const u={},a=n==="dialog"&&$t(e);function r(h){if(h===!0){Me(u),d.value=!0;return}d.value=!1,i.value===!1&&(a===!1&&l===null&&(l=kt(!1,n)),i.value=!0,_.push(e.proxy),Ot(u))}function c(h){if(d.value=!1,h!==!0)return;Me(u),i.value=!1;const g=_.indexOf(e.proxy);g!==-1&&_.splice(g,1),l!==null&&(qt(l),l=null)}return wt(()=>{c(!0)}),e.proxy.__qPortal=!0,pt(e.proxy,"contentEl",()=>t.value),{showPortal:r,hidePortal:c,portalIsActive:i,portalIsAccessible:d,renderPortal:()=>a===!0?o():i.value===!0?[q(xt,{to:l},o())]:void 0}}const Ze={transitionShow:{type:String,default:"fade"},transitionHide:{type:String,default:"fade"},transitionDuration:{type:[String,Number],default:300}};function et(e,t=()=>{},o=()=>{}){return{transitionProps:y(()=>{const n=`q-transition--${e.transitionShow||t()}`,i=`q-transition--${e.transitionHide||o()}`;return{appear:!0,enterFromClass:`${n}-enter-from`,enterActiveClass:`${n}-enter-active`,enterToClass:`${n}-enter-to`,leaveFromClass:`${i}-leave-from`,leaveActiveClass:`${i}-leave-active`,leaveToClass:`${i}-leave-to`}}),transitionStyle:y(()=>`--q-transition-duration: ${e.transitionDuration}ms`)}}function tt(){let e;const t=P();function o(){e=void 0}return ze(o),H(o),{removeTick:o,registerTick(n){e=n,Q(()=>{e===n&&(Fe(t)===!1&&e(),e=void 0)})}}}function nt(){let e=null;const t=P();function o(){e!==null&&(clearTimeout(e),e=null)}return ze(o),H(o),{removeTimeout:o,registerTimeout(n,i){o(),Fe(t)===!1&&(e=setTimeout(n,i))}}}const A=[];let V;function Mt(e){V=e.keyCode===27}function Wt(){V===!0&&(V=!1)}function At(e){V===!0&&(V=!1,Ce(e,27)===!0&&A[A.length-1](e))}function ot(e){window[e]("keydown",Mt),window[e]("blur",Wt),window[e]("keyup",At),V=!1}function Rt(e){Le.is.desktop===!0&&(A.push(e),A.length===1&&ot("addEventListener"))}function We(e){const t=A.indexOf(e);t>-1&&(A.splice(t,1),A.length===0&&ot("removeEventListener"))}const R=[];function it(e){R[R.length-1](e)}function Dt(e){Le.is.desktop===!0&&(R.push(e),R.length===1&&document.body.addEventListener("focusin",it))}function zt(e){const t=R.indexOf(e);t>-1&&(R.splice(t,1),R.length===0&&document.body.removeEventListener("focusin",it))}const{notPassiveCapture:se}=Y,D=[];function ce(e){const t=e.target;if(t===void 0||t.nodeType===8||t.classList.contains("no-pointer-events")===!0)return;let o=_.length-1;for(;o>=0;){const n=_[o].$;if(n.type.name!=="QDialog")break;if(n.props.seamless!==!0)return;o--}for(let n=D.length-1;n>=0;n--){const i=D[n];if((i.anchorEl.value===null||i.anchorEl.value.contains(t)===!1)&&(t===document.body||i.innerRef.value!==null&&i.innerRef.value.contains(t)===!1))e.qClickOutside=!0,i.onClickOutside(e);else return}}function lt(e){D.push(e),D.length===1&&(document.addEventListener("mousedown",ce,se),document.addEventListener("touchstart",ce,se))}function de(e){const t=D.findIndex(o=>o===e);t>-1&&(D.splice(t,1),D.length===0&&(document.removeEventListener("mousedown",ce,se),document.removeEventListener("touchstart",ce,se)))}let Ae,Re;function fe(e){const t=e.split(" ");return t.length!==2?!1:["top","center","bottom"].includes(t[0])!==!0?(console.error("Anchor/Self position must start with one of top/center/bottom"),!1):["left","middle","right","start","end"].includes(t[1])!==!0?(console.error("Anchor/Self position must end with one of left/middle/right/start/end"),!1):!0}function at(e){return e?!(e.length!==2||typeof e[0]!="number"||typeof e[1]!="number"):!0}const Se={"start#ltr":"left","start#rtl":"right","end#ltr":"right","end#rtl":"left"};["left","middle","right"].forEach(e=>{Se[`${e}#ltr`]=e,Se[`${e}#rtl`]=e});function ve(e,t){const o=e.split(" ");return{vertical:o[0],horizontal:Se[`${o[1]}#${t===!0?"rtl":"ltr"}`]}}function Ft(e,t){let{top:o,left:n,right:i,bottom:d,width:l,height:u}=e.getBoundingClientRect();return t!==void 0&&(o-=t[1],n-=t[0],d+=t[1],i+=t[0],l+=t[0],u+=t[1]),{top:o,bottom:d,height:u,left:n,right:i,width:l,middle:n+(i-n)/2,center:o+(d-o)/2}}function _t(e,t,o){let{top:n,left:i}=e.getBoundingClientRect();return n+=t.top,i+=t.left,o!==void 0&&(n+=o[1],i+=o[0]),{top:n,bottom:n+1,height:1,left:i,right:i+1,width:1,middle:i,center:n}}function Qt(e){return{top:0,center:e.offsetHeight/2,bottom:e.offsetHeight,left:0,middle:e.offsetWidth/2,right:e.offsetWidth}}function De(e,t,o){return{top:e[o.anchorOrigin.vertical]-t[o.selfOrigin.vertical],left:e[o.anchorOrigin.horizontal]-t[o.selfOrigin.horizontal]}}function ut(e){if(Le.is.ios===!0&&window.visualViewport!==void 0){const u=document.body.style,{offsetLeft:a,offsetTop:r}=window.visualViewport;a!==Ae&&(u.setProperty("--q-pe-left",a+"px"),Ae=a),r!==Re&&(u.setProperty("--q-pe-top",r+"px"),Re=r)}const{scrollLeft:t,scrollTop:o}=e.el,n=e.absoluteOffset===void 0?Ft(e.anchorEl,e.cover===!0?[0,0]:e.offset):_t(e.anchorEl,e.absoluteOffset,e.offset);let i={maxHeight:e.maxHeight,maxWidth:e.maxWidth,visibility:"visible"};(e.fit===!0||e.cover===!0)&&(i.minWidth=n.width+"px",e.cover===!0&&(i.minHeight=n.height+"px")),Object.assign(e.el.style,i);const d=Qt(e.el);let l=De(n,d,e);if(e.absoluteOffset===void 0||e.offset===void 0)qe(l,n,d,e.anchorOrigin,e.selfOrigin);else{const{top:u,left:a}=l;qe(l,n,d,e.anchorOrigin,e.selfOrigin);let r=!1;if(l.top!==u){r=!0;const c=2*e.offset[1];n.center=n.top-=c,n.bottom-=c+2}if(l.left!==a){r=!0;const c=2*e.offset[0];n.middle=n.left-=c,n.right-=c+2}r===!0&&(l=De(n,d,e),qe(l,n,d,e.anchorOrigin,e.selfOrigin))}i={top:l.top+"px",left:l.left+"px"},l.maxHeight!==void 0&&(i.maxHeight=l.maxHeight+"px",n.height>l.maxHeight&&(i.minHeight=i.maxHeight)),l.maxWidth!==void 0&&(i.maxWidth=l.maxWidth+"px",n.width>l.maxWidth&&(i.minWidth=i.maxWidth)),Object.assign(e.el.style,i),e.el.scrollTop!==o&&(e.el.scrollTop=o),e.el.scrollLeft!==t&&(e.el.scrollLeft=t)}function qe(e,t,o,n,i){const d=o.bottom,l=o.right,u=Lt(),a=window.innerHeight-u,r=document.body.clientWidth;if(e.top<0||e.top+d>a)if(i.vertical==="center")e.top=t[n.vertical]>a/2?Math.max(0,a-d):0,e.maxHeight=Math.min(d,a);else if(t[n.vertical]>a/2){const c=Math.min(a,n.vertical==="center"?t.center:n.vertical===i.vertical?t.bottom:t.top);e.maxHeight=Math.min(d,c),e.top=Math.max(0,c-d)}else e.top=Math.max(0,n.vertical==="center"?t.center:n.vertical===i.vertical?t.top:t.bottom),e.maxHeight=Math.min(d,a-e.top);if(e.left<0||e.left+l>r)if(e.maxWidth=Math.min(l,r),i.horizontal==="middle")e.left=t[n.horizontal]>r/2?Math.max(0,r-l):0;else if(t[n.horizontal]>r/2){const c=Math.min(r,n.horizontal==="middle"?t.middle:n.horizontal===i.horizontal?t.right:t.left);e.maxWidth=Math.min(l,c),e.left=Math.max(0,c-e.maxWidth)}else e.left=Math.max(0,n.horizontal==="middle"?t.middle:n.horizontal===i.horizontal?t.left:t.right),e.maxWidth=Math.min(l,r-e.left)}var nn=B({name:"QMenu",inheritAttrs:!1,props:{...Ne,...Ue,...me,...Ze,persistent:Boolean,autoClose:Boolean,separateClosePopup:Boolean,noRouteDismiss:Boolean,noRefocus:Boolean,noFocus:Boolean,fit:Boolean,cover:Boolean,square:Boolean,anchor:{type:String,validator:fe},self:{type:String,validator:fe},offset:{type:Array,validator:at},scrollTarget:{default:void 0},touchPosition:Boolean,maxHeight:{type:String,default:null},maxWidth:{type:String,default:null}},emits:[...Ge,"click","escapeKey"],setup(e,{slots:t,emit:o,attrs:n}){let i=null,d,l,u;const a=P(),{proxy:r}=a,{$q:c}=r,h=E(null),g=E(!1),s=y(()=>e.persistent!==!0&&e.noRouteDismiss!==!0),w=he(e,c),{registerTick:T,removeTick:O}=tt(),{registerTimeout:L}=nt(),{transitionProps:v,transitionStyle:m}=et(e),{localScrollTarget:$,changeScrollEvent:x,unconfigureScrollTarget:ge}=Ie(e,b),{anchorEl:k,canShow:be}=Ke({showing:g}),{hide:z}=Xe({showing:g,canShow:be,handleShow:oe,handleHide:pe,hideOnRouteChange:s,processOnMount:!0}),{showPortal:j,hidePortal:N,renderPortal:ye}=Je(a,h,rt,"menu"),K={anchorEl:k,innerRef:h,onClickOutside(f){if(e.persistent!==!0&&g.value===!0)return z(f),(f.type==="touchstart"||f.target.classList.contains("q-dialog__backdrop"))&&Pe(f),!0}},ee=y(()=>ve(e.anchor||(e.cover===!0?"center middle":"bottom start"),c.lang.rtl)),te=y(()=>e.cover===!0?ee.value:ve(e.self||"top start",c.lang.rtl)),M=y(()=>(e.square===!0?" q-menu--square":"")+(w.value===!0?" q-menu--dark q-dark":"")),we=y(()=>e.autoClose===!0?{onClick:U}:{}),ne=y(()=>g.value===!0&&e.persistent!==!0);C(ne,f=>{f===!0?(Rt(F),lt(K)):(We(F),de(K))});function I(){Bt(()=>{let f=h.value;f&&f.contains(document.activeElement)!==!0&&(f=f.querySelector("[autofocus][tabindex], [data-autofocus][tabindex]")||f.querySelector("[autofocus] [tabindex], [data-autofocus] [tabindex]")||f.querySelector("[autofocus], [data-autofocus]")||f,f.focus({preventScroll:!0}))})}function oe(f){if(i=e.noRefocus===!1?document.activeElement:null,Dt(S),j(),b(),d=void 0,f!==void 0&&(e.touchPosition||e.contextMenu)){const xe=Tt(f);if(xe.left!==void 0){const{top:st,left:ct}=k.value.getBoundingClientRect();d={left:xe.left-ct,top:xe.top-st}}}l===void 0&&(l=C(()=>c.screen.width+"|"+c.screen.height+"|"+e.self+"|"+e.anchor+"|"+c.lang.rtl,G)),e.noFocus!==!0&&document.activeElement.blur(),T(()=>{G(),e.noFocus!==!0&&I()}),L(()=>{c.platform.is.ios===!0&&(u=e.autoClose,h.value.click()),G(),j(!0),o("show",f)},e.transitionDuration)}function pe(f){O(),N(),ie(!0),i!==null&&(f===void 0||f.qClickOutside!==!0)&&(((f&&f.type.indexOf("key")===0?i.closest('[tabindex]:not([tabindex^="-"])'):void 0)||i).focus(),i=null),L(()=>{N(!0),o("hide",f)},e.transitionDuration)}function ie(f){d=void 0,l!==void 0&&(l(),l=void 0),(f===!0||g.value===!0)&&(zt(S),ge(),de(K),We(F)),f!==!0&&(i=null)}function b(){(k.value!==null||e.scrollTarget!==void 0)&&($.value=Ve(k.value,e.scrollTarget),x($.value,G))}function U(f){u!==!0?(Ye(r,f),o("click",f)):u=!1}function S(f){ne.value===!0&&e.noFocus!==!0&&Et(h.value,f.target)!==!0&&I()}function F(f){o("escapeKey"),z(f)}function G(){const f=h.value;f===null||k.value===null||ut({el:f,offset:e.offset,anchorEl:k.value,anchorOrigin:ee.value,selfOrigin:te.value,absoluteOffset:d,fit:e.fit,cover:e.cover,maxHeight:e.maxHeight,maxWidth:e.maxWidth})}function rt(){return q(_e,v.value,()=>g.value===!0?q("div",{role:"menu",...n,ref:h,tabindex:-1,class:["q-menu q-position-engine scroll"+M.value,n.class],style:[n.style,m.value],...we.value},Z(t.default)):null)}return H(ie),Object.assign(r,{focus:I,updatePosition:G}),ye}}),on=B({name:"QList",props:{...me,bordered:Boolean,dense:Boolean,separator:Boolean,padding:Boolean,tag:{type:String,default:"div"}},setup(e,{slots:t}){const o=P(),n=he(e,o.proxy.$q),i=y(()=>"q-list"+(e.bordered===!0?" q-list--bordered":"")+(e.dense===!0?" q-list--dense":"")+(e.separator===!0?" q-list--separator":"")+(n.value===!0?" q-list--dark":"")+(e.padding===!0?" q-list--padding":""));return()=>q(e.tag,{class:i.value},Z(t.default))}}),ln=B({name:"QTooltip",inheritAttrs:!1,props:{...Ne,...Ue,...Ze,maxHeight:{type:String,default:null},maxWidth:{type:String,default:null},transitionShow:{default:"jump-down"},transitionHide:{default:"jump-up"},anchor:{type:String,default:"bottom middle",validator:fe},self:{type:String,default:"top middle",validator:fe},offset:{type:Array,default:()=>[14,14],validator:at},scrollTarget:{default:void 0},delay:{type:Number,default:0},hideDelay:{type:Number,default:0}},emits:[...Ge],setup(e,{slots:t,emit:o,attrs:n}){let i,d;const l=P(),{proxy:{$q:u}}=l,a=E(null),r=E(!1),c=y(()=>ve(e.anchor,u.lang.rtl)),h=y(()=>ve(e.self,u.lang.rtl)),g=y(()=>e.persistent!==!0),{registerTick:s,removeTick:w}=tt(),{registerTimeout:T}=nt(),{transitionProps:O,transitionStyle:L}=et(e),{localScrollTarget:v,changeScrollEvent:m,unconfigureScrollTarget:$}=Ie(e,oe),{anchorEl:x,canShow:ge,anchorEvents:k}=Ke({showing:r,configureAnchorEl:I}),{show:be,hide:z}=Xe({showing:r,canShow:ge,handleShow:K,handleHide:ee,hideOnRouteChange:g,processOnMount:!0});Object.assign(k,{delayShow:we,delayHide:ne});const{showPortal:j,hidePortal:N,renderPortal:ye}=Je(l,a,ie,"tooltip");if(u.platform.is.mobile===!0){const b={anchorEl:x,innerRef:a,onClickOutside(S){return z(S),S.target.classList.contains("q-dialog__backdrop")&&Pe(S),!0}},U=y(()=>e.modelValue===null&&e.persistent!==!0&&r.value===!0);C(U,S=>{(S===!0?lt:de)(b)}),H(()=>{de(b)})}function K(b){j(),s(()=>{d=new MutationObserver(()=>M()),d.observe(a.value,{attributes:!1,childList:!0,characterData:!0,subtree:!0}),M(),oe()}),i===void 0&&(i=C(()=>u.screen.width+"|"+u.screen.height+"|"+e.self+"|"+e.anchor+"|"+u.lang.rtl,M)),T(()=>{j(!0),o("show",b)},e.transitionDuration)}function ee(b){w(),N(),te(),T(()=>{N(!0),o("hide",b)},e.transitionDuration)}function te(){d!==void 0&&(d.disconnect(),d=void 0),i!==void 0&&(i(),i=void 0),$(),Te(k,"tooltipTemp")}function M(){const b=a.value;x.value===null||!b||ut({el:b,offset:e.offset,anchorEl:x.value,anchorOrigin:c.value,selfOrigin:h.value,maxHeight:e.maxHeight,maxWidth:e.maxWidth})}function we(b){if(u.platform.is.mobile===!0){Ee(),document.body.classList.add("non-selectable");const U=x.value,S=["touchmove","touchcancel","touchend","click"].map(F=>[U,F,"delayHide","passiveCapture"]);re(k,"tooltipTemp",S)}T(()=>{be(b)},e.delay)}function ne(b){u.platform.is.mobile===!0&&(Te(k,"tooltipTemp"),Ee(),setTimeout(()=>{document.body.classList.remove("non-selectable")},10)),T(()=>{z(b)},e.hideDelay)}function I(){if(e.noParentEvent===!0||x.value===null)return;const b=u.platform.is.mobile===!0?[[x.value,"touchstart","delayShow","passive"]]:[[x.value,"mouseenter","delayShow","passive"],[x.value,"mouseleave","delayHide","passive"]];re(k,"anchor",b)}function oe(){if(x.value!==null||e.scrollTarget!==void 0){v.value=Ve(x.value,e.scrollTarget);const b=e.noParentEvent===!0?M:z;m(v.value,b)}}function pe(){return r.value===!0?q("div",{...n,ref:a,class:["q-tooltip q-tooltip--style q-position-engine no-pointer-events",n.class],style:[n.style,L.value],role:"tooltip"},Z(t.default)):null}function ie(){return q(_e,O.value,pe)}return H(te),Object.assign(l.proxy,{updatePosition:M}),ye}});export{ln as A,en as B,tn as C,Nt as D,jt as E,Kt as Q,he as a,It as b,Ut as c,Lt as d,Bt as e,Xt as f,Ve as g,Gt as h,Ue as i,Ze as j,Ge as k,nt as l,tt as m,et as n,Je as o,Xe as p,zt as q,Yt as r,We as s,Dt as t,me as u,Rt as v,nn as w,Zt as x,Jt as y,on as z};
