#include<bits/stdc++.h>
using namespace std;

// If I wanna make it unique I can use set data structure.

void per(string a,int l,int r)
{
    if(l == r) 
    {
        cout<<a<<endl;
        return;
    }

    for(int i=l;i<=r;i++)
    {
        swap(a[l],a[i]);
        per(a,l+1,r);
        swap(a[l],a[i]);
    }
}


int main()
{
    string a;

    cin>>a;

    per(a,0,a.length()-1);


    return 0;
}
