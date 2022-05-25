import Sellers, { SellerSchema } from 'models/Sellers';
import { VercelRequestBody } from '@vercel/node';
import verifyToken from 'utils/VerifyToken';

export default async function verifyRole(
    req: VercelRequestBody, roles: String[]
) {
    const authentication = verifyToken(req);
    if (!authentication.auth) {
        return false;
    }

    const seller = await Sellers.findOne(
        { email: authentication.email }
    ) as SellerSchema; 
    if (!seller || roles.indexOf(seller.type) === -1) {
        return false;
    }
    return seller.type
}