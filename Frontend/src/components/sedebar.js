

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
                <ul className="sidebar-nav">
                  <li className="sidebar-header">Main Menu</li>
                  <li className="sidebar-item">
                    <a href="#" className="sidebar-link">
                      <i className="bi bi-grid-fill pe-2"></i>
                      Dashboard
                    </a>
                  </li>
                  <li className="sidebar-item">
                    <a href="#" className="sidebar-link collapsed">
                      <i className="bi bi-telephone-fill pe-2"></i>
                      Sales Calls
                    </a>
                  </li>
                  <li className="sidebar-item">
                    <a href="#" className="sidebar-link collapsed">
                      <i className="bi bi-chat-dots-fill pe-2"></i>
                      Chats
                    </a>
                  </li>
                  <li className="sidebar-item">
                    <a href="#" className="sidebar-link collapsed">
                      <i className="bi bi-bar-chart-line-fill pe-2"></i>
                      Analysis
                    </a>
                  </li>
                  <li className="sidebar-header pt-4">General</li>
                  <li className="sidebar-item">
                    <a href="#" className="sidebar-link collapsed">
                      <i className="bi bi-patch-question-fill pe-2"></i>
                      FAQs
                    </a>
                  </li>
                  <li className="sidebar-item">
                    <a href="#" className="sidebar-link collapsed">
                      <i className="bi bi-gear-fill pe-2"></i>
                      Settings
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
        </>
    )
}