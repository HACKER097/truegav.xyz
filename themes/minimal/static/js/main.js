(function(){
  'use strict';

  // ---- reading progress bar ----
  const bar=document.querySelector('.reading-progress');
  if(bar){
    const article=document.querySelector('article');
    if(article){
      const update=()=>{
        const rect=article.getBoundingClientRect();
        const total=rect.height-window.innerHeight;
        const pct=Math.min(100,Math.max(0,(-rect.top/total)*100));
        bar.style.width=pct+'%';
        bar.classList.toggle('active',pct>0&&pct<100);
      };
      window.addEventListener('scroll',update,{passive:true});
      update();
    }
  }

  // ---- code block enhancements ----
  document.querySelectorAll('.content pre').forEach(pre=>{
    const lang = pre.getAttribute('data-lang') || ''

    const wrapper=document.createElement('div');
    wrapper.className='code-block';
    pre.parentNode.insertBefore(wrapper,pre);
    wrapper.appendChild(pre);

    if(lang){
      const label=document.createElement('span');
      label.className='code-lang';
      label.textContent=lang;
      wrapper.appendChild(label);
    }

    const btn=document.createElement('button');
    btn.className='copy-btn';
    btn.textContent='copy';
    btn.setAttribute('aria-label','Copy code to clipboard');
    btn.addEventListener('click',()=>{
      const text=pre.textContent;
      navigator.clipboard.writeText(text).then(()=>{
        btn.textContent='copied';
        btn.classList.add('copied');
        setTimeout(()=>{
          btn.textContent='copy';
          btn.classList.remove('copied');
        },1500);
      }).catch(()=>{});
    });
    wrapper.appendChild(btn);
  });

  // ---- scroll reveal ----
  const reveals=document.querySelectorAll('.reveal');
  if(reveals.length){
    const io=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },{threshold:0.1,rootMargin:'0px 0px -20px 0px'});
    reveals.forEach(el=>io.observe(el));
  }

  // ---- keyboard navigation ----
  const postLinks=Array.from(document.querySelectorAll('.post'));
  let selected=-1;
  let waitingForSecondG=false;
  const footerHints=document.querySelector('.footer-hints');
  const originalFooterHTML=footerHints?footerHints.innerHTML:'';
  const isHome=window.location.pathname==='/'||window.location.pathname==='/posts/';
  const isPost=window.location.pathname.startsWith('/posts/')&&!isHome;

  const updateFooter=()=>{
    if(!footerHints) return;
    if(selected>=0&&postLinks.length){
      footerHints.innerHTML=
        `<span><kbd>j</kbd>/<kbd>k</kbd> nav</span>`+
        `<span>${selected+1}/${postLinks.length}</span>`+
        `<span><kbd>enter</kbd> open</span>`;
    }else{
      footerHints.innerHTML=originalFooterHTML;
    }
  };

  const setSelected=(idx)=>{
    postLinks.forEach(a=>a.classList.remove('selected'));
    if(idx<0||idx>=postLinks.length){
      selected=-1;
      updateFooter();
      return;
    }
    selected=idx;
    postLinks[selected].classList.add('selected');
    postLinks[selected].scrollIntoView({block:'nearest',behavior:'instant'});
    updateFooter();
  };

  const openSelected=()=>{
    if(selected>=0&&selected<postLinks.length){
      postLinks[selected].click();
    }
  };

  // ---- footer search ----
  const footerCmd=document.querySelector('.footer-cmd');
  const cmdInput=footerCmd?.querySelector('.cmd-input');
  const cmdCount=footerCmd?.querySelector('.cmd-count');
  let searchActive=false;
  let searchQuery='';
  let searchMatches=[];
  let searchMatchIdx=-1;

  const clearHighlights=()=>{
    document.querySelectorAll('.search-match').forEach(el=>{
      const parent=el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent),el);
      parent.normalize();
    });
    searchMatches=[];
    searchMatchIdx=-1;
  };

  const doBlogSearch=(q)=>{
    clearHighlights();
    if(!q) return;
    const article=document.querySelector('.content');
    if(!article) return;
    const walker=document.createTreeWalker(article,NodeFilter.SHOW_TEXT,{
      acceptNode:n=>{
        if(n.parentElement.closest('pre,script,style,.footer-cmd,h1,h2,h3,h4,h5,h6'))
          return NodeFilter.FILTER_REJECT;
        return n.textContent.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;
      }
    });
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    const lower=q.toLowerCase();
    for(const node of nodes){
      const text=node.textContent;
      const idx=text.toLowerCase().indexOf(lower);
      if(idx===-1) continue;
      const mark=document.createElement('mark');
      mark.className='search-match';
      const before=document.createTextNode(text.slice(0,idx));
      const match=document.createTextNode(text.slice(idx,idx+q.length));
      const after=document.createTextNode(text.slice(idx+q.length));
      mark.appendChild(match);
      const parent=node.parentNode;
      parent.insertBefore(before,node);
      parent.insertBefore(mark,before.nextSibling);
      parent.insertBefore(after,mark.nextSibling);
      parent.removeChild(node);
      searchMatches.push(mark);
    }
  };

  const gotoMatch=(idx)=>{
    if(!searchMatches.length) return;
    searchMatches.forEach(m=>m.classList.remove('search-match-current'));
    searchMatchIdx=((idx%searchMatches.length)+searchMatches.length)%searchMatches.length;
    searchMatches[searchMatchIdx].classList.add('search-match-current');
    searchMatches[searchMatchIdx].scrollIntoView({block:'center',behavior:'smooth'});
    cmdCount.textContent=`${searchMatchIdx+1}/${searchMatches.length}`;
  };

  const gotoNextVisiblePost=(dir)=>{
    const visible=postLinks.filter(p=>p.style.display!=='none');
    if(!visible.length) return;
    let curIdx=visible.indexOf(postLinks[selected]);
    if(curIdx===-1) curIdx=dir>0?-1:visible.length;
    const next=(curIdx+dir+visible.length)%visible.length;
    setSelected(postLinks.indexOf(visible[next]));
  };

  const openSearch=()=>{
    footerCmd.classList.add('active');
    footerHints.classList.add('hidden');
    cmdInput.value='';
    cmdInput.focus();
    searchActive=true;
    searchQuery='';
    cmdCount.textContent='';
  };

  const closeSearch=()=>{
    footerCmd.classList.remove('active');
    footerHints.classList.remove('hidden');
    cmdInput.value='';
    cmdInput.blur();
    searchActive=false;
    searchQuery='';
    cmdCount.textContent='';
    if(isHome){
      postLinks.forEach(p=>p.style.display='');
      selected=-1;
      updateFooter();
    }else{
      clearHighlights();
    }
  };

  if(cmdInput){
    cmdInput.addEventListener('input',()=>{
      const q=cmdInput.value.trim();
      searchQuery=q;
      if(!q){
        if(isHome){
          postLinks.forEach(p=>p.style.display='');
          cmdCount.textContent='';
        }else{
          clearHighlights();
          cmdCount.textContent='';
        }
        return;
      }
      if(isHome){
        const lower=q.toLowerCase();
        let visible=0;
        postLinks.forEach(p=>{
          const title=(p.querySelector('.post-title')?.textContent||'').toLowerCase();
          const tags=(p.querySelector('.post-tags')?.textContent||'').toLowerCase();
          const show=title.includes(lower)||tags.includes(lower);
          p.style.display=show?'':'none';
          if(show) visible++;
        });
        cmdCount.textContent=visible?`${visible}p`:'0p';
      }else{
        doBlogSearch(q);
        cmdCount.textContent=searchMatches.length?`${searchMatches.length}m`:'0m';
      }
    });

    cmdInput.addEventListener('keydown',(e)=>{
      if(e.key==='Escape'){
        e.preventDefault();e.stopPropagation();
        closeSearch();
      }
      if(e.key==='Enter'){
        e.preventDefault();e.stopPropagation();
        if(isHome&&searchQuery){
          const visible=postLinks.filter(p=>p.style.display!=='none');
          if(visible.length) setSelected(postLinks.indexOf(visible[0]));
        }else if(!isHome&&searchMatches.length){
          gotoMatch(searchMatchIdx<0?0:searchMatchIdx);
        }
        cmdInput.blur();
      }
    });

    cmdInput.addEventListener('focus',()=>{searchActive=true});
    cmdInput.addEventListener('blur',()=>{searchActive=false});
  }

  // ---- global key bindings ----
  document.addEventListener('keydown',(e)=>{
    if(searchActive) return;
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;

    if(e.key==='/'&&!e.metaKey&&!e.ctrlKey&&footerCmd){
      e.preventDefault();
      openSearch();
      return;
    }

    if((e.key==='n'||e.key==='N')&&!e.metaKey&&!e.ctrlKey&&searchQuery){
      e.preventDefault();
      const dir=e.key==='n'?1:-1;
      if(isHome){
        gotoNextVisiblePost(dir);
      }else if(searchMatches.length){
        gotoMatch(searchMatchIdx+dir);
      }
      return;
    }

    if(e.key==='Escape'){
      closeSearch();
      selected=-1;
      postLinks.forEach(a=>a.classList.remove('selected'));
      updateFooter();
    }

    if(e.key==='j'&&!e.metaKey&&!e.ctrlKey){
      e.preventDefault();
      if(isPost&&!postLinks.length){
        window.scrollBy({top:60,behavior:'smooth'});
      }else if(postLinks.length){
        const next=Math.min(selected+1,postLinks.length-1);
        setSelected(next);
        postLinks[next]?.classList.add('pulse');
        setTimeout(()=>postLinks[next]?.classList.remove('pulse'),120);
      }
      return;
    }
    if(e.key==='k'&&!e.metaKey&&!e.ctrlKey){
      e.preventDefault();
      if(isPost&&!postLinks.length){
        window.scrollBy({top:-60,behavior:'smooth'});
      }else if(postLinks.length){
        const prev=Math.max(selected-1,0);
        setSelected(prev);
        postLinks[prev]?.classList.add('pulse');
        setTimeout(()=>postLinks[prev]?.classList.remove('pulse'),120);
      }
      return;
    }

    if(e.key==='g'&&!e.metaKey&&!e.ctrlKey){
      if(!waitingForSecondG){
        waitingForSecondG=true;
        setTimeout(()=>{waitingForSecondG=false},500);
        return;
      }
      waitingForSecondG=false;
      if(postLinks.length){
        e.preventDefault();
        setSelected(0);
      }else if(isPost){
        e.preventDefault();
        window.scrollTo({top:0,behavior:'smooth'});
      }
      return;
    }
    waitingForSecondG=false;

    if(e.key==='G'&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey){
      if(postLinks.length){
        e.preventDefault();
        setSelected(postLinks.length-1);
      }else if(isPost){
        e.preventDefault();
        window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
      }
      return;
    }

    if((e.key==='Enter'||(e.key==='l'&&!e.metaKey&&!e.ctrlKey))&&selected>=0){
      e.preventDefault();
      openSelected();
      return;
    }

    if(e.key==='h'&&!e.metaKey&&!e.ctrlKey){
      e.preventDefault();
      if(isPost){
        window.location.href='/posts/';
      }else if(isHome&&window.location.pathname!=='/'){
        window.location.href='/';
      }
      return;
    }
  });

  // ---- active nav link ----
  const path=window.location.pathname;
  document.querySelectorAll('nav a').forEach(a=>{
    const href=a.getAttribute('href');
    if(href==='/'&&path==='/'){
      a.classList.add('active');
    }else if(href!=='/'&&path.startsWith(href)){
      a.classList.add('active');
    }
  });
})();
