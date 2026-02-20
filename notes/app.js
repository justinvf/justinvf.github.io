(function() {
  'use strict';

  function icon(id) {
    return document.getElementById('icon-' + id).content.cloneNode(true);
  }

  const STORAGE_KEY = 'private_notes';
  const SAVE_INTERVAL = 1500;

  let snippets = [];
  let activeId = null;
  let saveTimer = null;
  let pendingDeleteId = null;

  const editor = document.getElementById('editor');
  const blurToggle = document.getElementById('blurToggle');
  const menuBtn = document.getElementById('menuBtn');
  const newBtn = document.getElementById('newBtn');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const closeDrawer = document.getElementById('closeDrawer');
  const snippetList = document.getElementById('snippetList');
  const currentTitle = document.getElementById('currentTitle');
  const toast = document.getElementById('toast');
  const deleteModal = document.getElementById('deleteModal');
  const deleteCancelBtn = document.getElementById('deleteCancelBtn');
  const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        snippets = data.snippets || [];
        activeId = data.activeId || null;
      }
    } catch(e) {}

    if (snippets.length === 0) {
      createSnippet();
    } else {
      if (!activeId || !snippets.find(s => s.id === activeId)) {
        activeId = snippets[0].id;
      }
      loadActive();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        snippets: snippets,
        activeId: activeId
      }));
    } catch(e) {}
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, SAVE_INTERVAL);
  }

  function getTitle(text) {
    const first = (text || '').split('\n')[0].trim();
    return first.length > 0 ? first.substring(0, 60) : 'Untitled';
  }

  function createSnippet() {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    snippets.unshift({ id: id, text: '' });
    activeId = id;
    editor.value = '';
    updateTitle();
    save();
    editor.focus();
  }

  function loadActive() {
    const s = snippets.find(s => s.id === activeId);
    editor.value = s ? s.text : '';
    updateTitle();
  }

  function updateTitle() {
    const s = snippets.find(s => s.id === activeId);
    currentTitle.textContent = s ? getTitle(s.text) : 'Untitled';
  }

  function switchTo(id) {
    syncCurrent();
    activeId = id;
    loadActive();
    save();
    closeDrawerFn();
  }

  function syncCurrent() {
    const s = snippets.find(s => s.id === activeId);
    if (s) s.text = editor.value;
  }

  function deleteSnippet(id) {
    snippets = snippets.filter(s => s.id !== id);
    if (snippets.length === 0) {
      createSnippet();
    } else if (activeId === id) {
      activeId = snippets[0].id;
      loadActive();
    }
    save();
    renderList();
  }

  function openDrawerFn() {
    syncCurrent();
    renderList();
    drawer.classList.add('open');
    overlay.classList.add('open');
  }

  function closeDrawerFn() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }

  function renderList() {
    snippetList.innerHTML = '';
    snippets.forEach(function(s) {
      const div = document.createElement('div');
      div.className = 'snippet-item' + (s.id === activeId ? ' active' : '');

      const titleSpan = document.createElement('div');
      titleSpan.style.cssText = 'flex:1;min-width:0;';

      const t = document.createElement('div');
      t.className = 'snippet-title';
      t.textContent = getTitle(s.text);

      const preview = document.createElement('div');
      preview.className = 'snippet-preview';
      const lines = (s.text || '').split('\n');
      preview.textContent = lines.length > 1 ? lines[1].substring(0, 80) : '';

      titleSpan.appendChild(t);
      titleSpan.appendChild(preview);

      const copyBtnEl = document.createElement('button');
      copyBtnEl.className = 'copy-btn';
      copyBtnEl.appendChild(icon('clipboard'));
      copyBtnEl.addEventListener('click', function(e) {
        e.stopPropagation();
        navigator.clipboard.writeText(s.text).then(function() {
          showToast('Copied');
        });
      });

      const del = document.createElement('button');
      del.className = 'delete-btn';
      del.appendChild(icon('trash'));
      del.addEventListener('click', function(e) {
        e.stopPropagation();
        pendingDeleteId = s.id;
        deleteModal.classList.add('open');
      });

      div.appendChild(titleSpan);
      div.appendChild(copyBtnEl);
      div.appendChild(del);
      div.addEventListener('click', function() { switchTo(s.id); });
      snippetList.appendChild(div);
    });
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 1800);
  }

  editor.addEventListener('input', function() {
    syncCurrent();
    updateTitle();
    scheduleSave();
  });

  var blurred = false;
  blurToggle.addEventListener('click', function() {
    blurred = !blurred;
    editor.classList.toggle('blurred', blurred);
    blurToggle.replaceChildren(icon(blurred ? 'eye-off' : 'eye'));
  });

  menuBtn.addEventListener('click', openDrawerFn);
  newBtn.addEventListener('click', function() {
    syncCurrent();
    save();
    createSnippet();
  });
  overlay.addEventListener('click', closeDrawerFn);
  closeDrawer.addEventListener('click', closeDrawerFn);

  deleteCancelBtn.addEventListener('click', function() {
    deleteModal.classList.remove('open');
    pendingDeleteId = null;
  });
  deleteConfirmBtn.addEventListener('click', function() {
    deleteSnippet(pendingDeleteId);
    deleteModal.classList.remove('open');
    pendingDeleteId = null;
  });
  deleteModal.addEventListener('click', function() {
    deleteModal.classList.remove('open');
    pendingDeleteId = null;
  });
  document.querySelector('.modal').addEventListener('click', function(e) { e.stopPropagation(); });

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) { syncCurrent(); save(); }
  });
  window.addEventListener('beforeunload', function() { syncCurrent(); save(); });

  load();

  menuBtn.appendChild(icon('menu'));
  newBtn.appendChild(icon('file-plus'));
  closeDrawer.appendChild(icon('x'));
  blurToggle.appendChild(icon('eye'));

  // --- Service Worker ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function() {});
  }
})();
