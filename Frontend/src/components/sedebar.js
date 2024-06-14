

export const Sidebar = ()=>{
    return(
        <>
            <aside id="sidebar">
              <div>
                <div className="index-logo p-2">
                  <a href="#">
                    magic<span>CX</span>
                  </a>
                </div>
                <ul class="sidebar-nav">
                  <li class="sidebar-header">Main Menu</li>
                  <li class="sidebar-item">
                    <a href="#" class="sidebar-link">
                      <i class="bi bi-grid-fill pe-2"></i>
                      Dashboard
                    </a>
                  </li>
                  <li class="sidebar-item">
                    <a href="#" class="sidebar-link collapsed">
                      <i class="bi bi-telephone-fill pe-2"></i>
                      Sales Calls
                    </a>
                  </li>
                  <li class="sidebar-item">
                    <a href="#" class="sidebar-link collapsed">
                      <i class="bi bi-chat-dots-fill pe-2"></i>
                      Chats
                    </a>
                  </li>
                  <li class="sidebar-item">
                    <a href="#" class="sidebar-link collapsed">
                      <i class="bi bi-bar-chart-line-fill pe-2"></i>
                      Analysis
                    </a>
                  </li>
                  <li class="sidebar-header pt-4">General</li>
                  <li class="sidebar-item">
                    <a href="#" class="sidebar-link collapsed">
                      <i class="bi bi-patch-question-fill pe-2"></i>
                      FAQs
                    </a>
                  </li>
                  <li class="sidebar-item">
                    <a href="#" class="sidebar-link collapsed">
                      <i class="bi bi-gear-fill pe-2"></i>
                      Settings
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
        </>
    )
}