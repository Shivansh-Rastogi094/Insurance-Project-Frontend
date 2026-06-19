import React from 'react'

   const Card = ({ title, value, icon, accent = 'accent-blue', prefix = '', sub = '' }) => (
     <div className={`card ${accent}`}>
       <div className="card-header">
         <h4>{title}</h4>
         <div className="card-icon-wrap">
           <span role="img" aria-hidden="true">{icon}</span>
         </div>
       </div>
       <p className="card-value">
         {prefix}{value}
       </p>
       {sub && <p className="card-sub">{sub}</p>}
     </div>
   );
export default Card