const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(
`              </div>
              </div>
              
              {adminTab === "topups" && adminSubTab === "paid" && (`,
`              </div>
              </div>
              )}
              
              {adminTab === "topups" && adminSubTab === "paid" && (`
);

c = c.replace(
`              </div>
              </div>
              )}

              {adminTab === "withdrawals" && adminSubTab === "paid" && (`,
`              </div>
              </div>
              )}

              {adminTab === "withdrawals" && adminSubTab === "paid" && (`
); // just leaving a dummy line in case I need to fix withdrawal ending later

fs.writeFileSync('src/App.tsx', c);
